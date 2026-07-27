// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { beautifyPurl } from "@/utils/common";

// Anchors a pattern at the root of every artifact.
const ROOT_TOKEN = "ROOT";
// Matches zero or more path segments.
const WILDCARD_TOKEN = "*";

export interface VexRuleVulnContext {
  cveID: string | null;
  componentPurl: string;
  // Ordered purls from the direct dependency down to the vulnerable component.
  vulnerabilityPath: string[];
  // Application / asset name rendered as the first (root) node.
  rootName: string;
}

/**
 * What to render for a rule/vulnerability pair. A new expression shape gets a new
 * type here plus a branch in the renderer.
 */
type VexRuleEffectType =
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

// Generated rules carry their explanation in a CEL comment, which is not part of
// the expression.
function stripCelComments(cel: string): string {
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
 * Top-level `&&` operands, skipping string literals and brackets — purls contain
 * "&". Null for `||`, which combines claims no single cut can represent.
 */
function splitTopLevelConjuncts(expr: string): string[] | null {
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

// A pattern's ROOT anchor, wildcards and concrete purls.
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
 * Matches a pattern against a dependency path. Anchored at ROOT without a
 * wildcard it describes the whole path; otherwise its concrete segments must form
 * a contiguous suffix.
 */
function matchPathPattern(
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
 * Where a matched pattern severs the path. A pattern names the disputed edge as
 * its first two segments, so the cut sits below the first concrete segment —
 * except when ROOT is the parent, or when a single component is named.
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
 * What a rule does to one vulnerability. The backend /test endpoint only counts
 * matches asset-wide, so this decides the shapes this flow produces locally and
 * reports anything else as `indeterminate`.
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

// A conjunction applies only if every operand does: the first failing operand
// explains why, and otherwise the path operand carries the cut.
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

// Both spellings of the identifier — `vuln.cve` itself is the CVE object.
const IDENTIFIER_PATTERN = /vuln\.(?:cveId|cve\.cve)\s*==\s*["']([^"']+)["']/;

/** The advisory a rule pins itself to (CVE-… / GHSA-…), if it does. */
export function extractVulnIdentifier(cel: string): string | null {
  return stripCelComments(cel).match(IDENTIFIER_PATTERN)?.[1] ?? null;
}

function matchAttribute(
  expr: string,
  vuln: VexRuleVulnContext,
): VexRuleEffect | null {
  const cve = expr.match(IDENTIFIER_PATTERN);
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

/** The two nodes a cut sits between. */
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
          `// "${ROOT_TOKEN}" matches all your artifacts and refs in this repo`,
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
