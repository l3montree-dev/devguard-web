// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { beautifyPurl } from "@/utils/common";

// The pattern token standing for the root node of an artifact. Since every
// artifact of an asset version has such a root, a pattern starting with ROOT
// matches all artifacts.
export const ROOT_TOKEN = "ROOT";
// Matches any number of intermediate path segments.
export const WILDCARD_TOKEN = "*";

export interface VexRuleVulnContext {
  cveID: string | null;
  componentPurl: string;
  // Ordered purls from the direct dependency down to the vulnerable component.
  vulnerabilityPath: string[];
  // Application / asset name rendered as the first (root) node.
  rootName: string;
}

/**
 * What the UI should render for a rule/vulnerability combination.
 *
 * - `pathCut`: a path rule matches — the path is severed at `cutIndex`.
 * - `pathIntact`: a path rule that does not match this path.
 * - `attributeMatch` / `attributeMiss`: a rule on a vuln attribute (cveId,
 *   componentPurl) — it dismisses the vulnerability as a whole, so no cut.
 * - `indeterminate`: the expression can't be decided client-side (combined
 *   expressions, or shapes this parser doesn't know yet).
 *
 * New expression shapes get a new type here plus a branch in the renderer.
 */
export type VexRuleEffectType =
  | "pathCut"
  | "pathIntact"
  | "attributeMatch"
  | "attributeMiss"
  | "indeterminate";

export interface VexRuleEffect {
  type: VexRuleEffectType;
  // Whether the rule applies to this vulnerability; null when indeterminate.
  applies: boolean | null;
  // Index into `vulnerabilityPath` of the first node the rule dismisses. The cut
  // sits on the edge entering that node; -1 when the rule cuts nothing.
  cutIndex: number;
  // Which attribute an `attributeMatch` / `attributeMiss` was decided on.
  matchedOn?: { field: "cveId" | "componentPurl"; value: string };
}

const INDETERMINATE: VexRuleEffect = {
  type: "indeterminate",
  applies: null,
  cutIndex: -1,
};

// CEL line comments carry the explanation of the generated rule; they are not
// part of the expression itself.
export function stripCelComments(cel: string): string {
  return cel
    .split("\n")
    .map((line) => {
      // Only strip "//" outside of string literals.
      let quote: string | null = null;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (quote) {
          if (char === "\\") i++;
          else if (char === quote) quote = null;
          continue;
        }
        if (char === '"' || char === "'") quote = char;
        else if (char === "/" && line[i + 1] === "/") return line.slice(0, i);
      }
      return line;
    })
    .join("\n");
}

/**
 * Splits an expression into its top-level `&&` operands, skipping string literals
 * and bracketed groups — purls contain "&", patterns contain commas. Returns null
 * for expressions this parser can't decompose: `||` combines two independent
 * claims, which no single cut can represent.
 */
export function splitTopLevelConjuncts(expr: string): string[] | null {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "(" || char === "[" || char === "{") {
      depth++;
    } else if (char === ")" || char === "]" || char === "}") {
      depth--;
    } else if (depth === 0 && char === "|" && expr[i + 1] === "|") {
      return null;
    } else if (depth === 0 && char === "&" && expr[i + 1] === "&") {
      parts.push(expr.slice(start, i));
      i++;
      start = i + 1;
    }
  }
  parts.push(expr.slice(start));

  const trimmed = parts.map((part) => part.trim()).filter(Boolean);
  return trimmed.length > 0 ? trimmed : null;
}

// Extracts the array from a `matchesPattern(vuln, [...])` call, if present.
export function extractPathPattern(cel: string): string[] | null {
  const match = cel.match(
    /matchesPattern\s*\(\s*vuln\s*,\s*(\[[\s\S]*?\])\s*\)/,
  );
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].replace(/'/g, '"'));
    return Array.isArray(parsed) ? parsed.map(String) : null;
  } catch {
    return null;
  }
}

// Splits a pattern into its ROOT anchor, its wildcards and the concrete purls.
function splitPattern(pattern: string[]): {
  anchoredAtRoot: boolean;
  hasWildcard: boolean;
  concrete: string[];
} {
  const anchoredAtRoot = pattern[0] === ROOT_TOKEN;
  const rest = anchoredAtRoot ? pattern.slice(1) : pattern;
  const concrete = rest.filter((segment) => segment !== WILDCARD_TOKEN);
  return {
    anchoredAtRoot,
    hasWildcard: rest.length !== concrete.length,
    concrete,
  };
}

/**
 * Best-effort match of a path pattern against a concrete dependency path.
 *
 * A pattern anchored at ROOT without a wildcard describes the full path, so its
 * segments must line up from the direct dependency onwards. Everything else is
 * treated as a suffix rule: the concrete segments must appear as a contiguous
 * suffix of the path.
 */
export function matchPathPattern(
  path: string[],
  pattern: string[],
): { matches: boolean; fromIndex: number } {
  const { anchoredAtRoot, hasWildcard, concrete } = splitPattern(pattern);

  if (concrete.length === 0) return { matches: true, fromIndex: 0 };

  if (anchoredAtRoot && !hasWildcard) {
    const matches =
      concrete.length === path.length &&
      concrete.every((segment, i) => segment === path[i]);
    return { matches, fromIndex: matches ? 0 : -1 };
  }

  if (concrete.length > path.length) return { matches: false, fromIndex: -1 };
  const fromIndex = path.length - concrete.length;
  const matches = concrete.every(
    (segment, i) => segment === path[fromIndex + i],
  );
  return { matches, fromIndex: matches ? fromIndex : -1 };
}

/**
 * Where a matched pattern severs the path — the node from which everything is
 * dismissed.
 *
 * A pattern names the disputed edge as its first two segments. When it is
 * anchored at ROOT the parent is the application root itself, so the cut sits at
 * the first concrete node. Otherwise the first concrete segment is the parent and
 * the cut sits one node below it — unless the pattern names a single component,
 * which can only mean that component itself is dismissed.
 */
function cutIndexFor(
  pattern: string[],
  path: string[],
  fromIndex: number,
): number {
  const { anchoredAtRoot, hasWildcard, concrete } = splitPattern(pattern);
  if ((anchoredAtRoot && !hasWildcard) || concrete.length < 2) return fromIndex;
  return Math.min(fromIndex + 1, Math.max(path.length - 1, 0));
}

/**
 * Client-side evaluation of what a rule does to one specific vulnerability. The
 * backend /test endpoint only returns a ref-wide count, so this covers the
 * statically decidable shapes this flow produces — a rule identifying the
 * vulnerability and constraining its path is a conjunction of them. Shapes this
 * parser doesn't know are reported as `indeterminate` — "can't tell locally".
 */
export function analyzeVexRuleEffect(
  cel: string,
  vuln: VexRuleVulnContext,
): VexRuleEffect {
  const expr = stripCelComments(cel).trim();
  if (!expr) return INDETERMINATE;

  const conjuncts = splitTopLevelConjuncts(expr);
  if (!conjuncts) return INDETERMINATE;
  if (conjuncts.length > 1) {
    return combineConjuncts(
      conjuncts.map((conjunct) => analyzeConjunct(conjunct, vuln)),
    );
  }

  return analyzeConjunct(conjuncts[0], vuln);
}

/**
 * A conjunction applies only if every operand does. The first operand that fails
 * is what the UI should explain — "the path doesn't match" or "that's a different
 * CVE" — and when they all hold, the path operand is the one carrying the cut.
 */
function combineConjuncts(effects: VexRuleEffect[]): VexRuleEffect {
  const failing = effects.find((effect) => effect.applies === false);
  if (failing) return failing;
  if (effects.some((effect) => effect.applies === null)) return INDETERMINATE;
  return effects.find((effect) => effect.type === "pathCut") ?? effects[0];
}

function analyzeConjunct(
  expr: string,
  vuln: VexRuleVulnContext,
): VexRuleEffect {
  const pattern = extractPathPattern(expr);
  if (pattern) {
    const path = vuln.vulnerabilityPath;
    const { matches, fromIndex } = matchPathPattern(path, pattern);
    if (!matches) return { type: "pathIntact", applies: false, cutIndex: -1 };
    // A match without a resolvable position still dismisses the vulnerable
    // component itself, so cut the last edge.
    if (fromIndex < 0)
      return {
        type: "pathCut",
        applies: true,
        cutIndex: Math.max(path.length - 1, 0),
      };
    return {
      type: "pathCut",
      applies: true,
      cutIndex: cutIndexFor(pattern, path, fromIndex),
    };
  }

  const attribute = matchAttribute(expr, vuln);
  if (attribute) return attribute;

  return INDETERMINATE;
}

function attributeEffect(
  applies: boolean,
  field: "cveId" | "componentPurl",
  value: string,
): VexRuleEffect {
  return {
    type: applies ? "attributeMatch" : "attributeMiss",
    applies,
    cutIndex: -1,
    matchedOn: { field, value },
  };
}

function matchAttribute(
  expr: string,
  vuln: VexRuleVulnContext,
): VexRuleEffect | null {
  // Both spellings of the identifier: the column on the vuln, and the id on the
  // nested CVE object. `vuln.cve` itself is that object, never a string.
  const cve = expr.match(/vuln\.(?:cveId|cve\.cve)\s*==\s*["']([^"']+)["']/);
  if (cve) return attributeEffect(cve[1] === vuln.cveID, "cveId", cve[1]);

  const purlEquals = expr.match(/vuln\.componentPurl\s*==\s*["']([^"']+)["']/);
  if (purlEquals)
    return attributeEffect(
      purlEquals[1] === vuln.componentPurl,
      "componentPurl",
      purlEquals[1],
    );

  const purlStartsWith = expr.match(
    /vuln\.componentPurl\.startsWith\(\s*["']([^"']+)["']\s*\)/,
  );
  if (purlStartsWith)
    return attributeEffect(
      vuln.componentPurl.startsWith(purlStartsWith[1]),
      "componentPurl",
      purlStartsWith[1],
    );

  return null;
}

/**
 * The two node names a cut sits between: the parent that is claimed not to call
 * the vulnerable function, and the child it no longer reaches.
 */
export function resolveCut(
  vuln: VexRuleVulnContext,
  cutIndex: number,
): { parent: string; child: string } | null {
  if (cutIndex < 0 || cutIndex >= vuln.vulnerabilityPath.length) return null;
  return {
    parent:
      cutIndex > 0
        ? beautifyPurl(vuln.vulnerabilityPath[cutIndex - 1])
        : vuln.rootName,
    child: beautifyPurl(vuln.vulnerabilityPath[cutIndex]),
  };
}

/**
 * Builds the rule for "this parent does not call the vulnerable function of that
 * child", from the index of the clicked edge's child node in the path.
 *
 * A rule pairs the vulnerability's identity with the path it is disputed on: the
 * path alone would dismiss every advisory reachable through it, so `cveID` scopes
 * it to this one. `vuln.cveId` is the identifier column (CVE and GHSA ids alike);
 * `vuln.cve` is the CVE object, and comparing that to a string never matches.
 *
 * The path claim is about one edge, so the pattern names that edge's parent and
 * everything below it — never the ancestors above the parent:
 *
 * - first edge (`app ⇥ web → brace-expansion`): `["ROOT", web, brace-expansion]`.
 *   The disputed parent is the application itself, and ROOT stands for it in
 *   every artifact.
 * - any deeper edge (`web ⇥ brace-expansion`): `["*", web, brace-expansion]`.
 *   The parent is a component, so the rule is about that component wherever it
 *   appears and ROOT has no place in it.
 */
export function buildPathPatternRule(
  path: string[],
  edgeIndex: number,
  cveID?: string | null,
): string {
  const [comment, pattern] =
    edgeIndex === 0
      ? [
          `// "${ROOT_TOKEN}" matches all your artifacts in this repo`,
          [ROOT_TOKEN, ...path],
        ]
      : [
          `// "${WILDCARD_TOKEN}" matches any dependencies above ${beautifyPurl(path[edgeIndex - 1])}`,
          [WILDCARD_TOKEN, ...path.slice(edgeIndex - 1)],
        ];

  const matchesPattern = `matchesPattern(vuln, ${JSON.stringify(pattern)})`;
  const expression = cveID
    ? `vuln.cveId == ${JSON.stringify(cveID)} && ${matchesPattern}`
    : matchesPattern;

  return [comment, expression].join("\n");
}
