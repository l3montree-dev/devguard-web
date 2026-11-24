// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { Diagnostic } from "@codemirror/lint";
import type { EditorView } from "codemirror";
import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";

import type { Token, TokenType } from "@/types/view/codeEditor";

class CelSyntaxError extends Error {
  pos: number;
  length: number;
  constructor(message: string, pos: number, length = 1) {
    super(message);
    this.pos = pos;
    this.length = length;
  }
}

// The helper functions the CEL environments expose which return a bool.
const BOOL_FUNCTIONS = ["matchesPattern", "matchesPurl", "isSemver", "has"];

// Macros and string methods of the CEL standard library which return a bool,
// e.g. otherRefs.all(other, ...) or ref.name.startsWith("release/").
const BOOL_METHODS = [
  "all",
  "exists",
  "exists_one",
  "startsWith",
  "endsWith",
  "contains",
  "matches",
];

const PUNCTUATORS = [
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "<",
  ">",
  "+",
  "-",
  "*",
  "/",
  "%",
  "!",
  "?",
  ":",
  ".",
  ",",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
];

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = expression.length;

  while (i < n) {
    const char = expression[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Line comment: skip to the end of the line, so a comment above or after an
    // expression documents it without hiding the expression from the parser.
    if (char === "/" && expression[i + 1] === "/") {
      while (i < n && expression[i] !== "\n") i++;
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      const start = i;
      i++;
      let closed = false;
      while (i < n) {
        if (expression[i] === "\\" && i + 1 < n) {
          i += 2;
          continue;
        }
        if (expression[i] === quote) {
          i++;
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) {
        throw new CelSyntaxError(
          "Unterminated string literal",
          start,
          i - start,
        );
      }
      tokens.push({
        type: "string",
        value: expression.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    if (/[0-9]/.test(char)) {
      const start = i;
      while (i < n && /[0-9]/.test(expression[i])) i++;
      if (expression[i] === "." && /[0-9]/.test(expression[i + 1] ?? "")) {
        i++;
        while (i < n && /[0-9]/.test(expression[i])) i++;
      }
      if (expression[i] === "e" || expression[i] === "E") {
        i++;
        if (expression[i] === "+" || expression[i] === "-") i++;
        while (i < n && /[0-9]/.test(expression[i])) i++;
      }
      if (expression[i] === "u" || expression[i] === "U") i++;
      tokens.push({
        type: "number",
        value: expression.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      const start = i;
      while (i < n && /[a-zA-Z0-9_]/.test(expression[i])) i++;
      const value = expression.slice(start, i);
      let type: TokenType = "ident";
      if (value === "true" || value === "false") type = "bool";
      else if (value === "null") type = "null";
      tokens.push({ type, value, start, end: i });
      continue;
    }

    const twoChar = expression.slice(i, i + 2);
    if (PUNCTUATORS.includes(twoChar)) {
      tokens.push({ type: "punct", value: twoChar, start: i, end: i + 2 });
      i += 2;
      continue;
    }

    if (PUNCTUATORS.includes(char)) {
      tokens.push({ type: "punct", value: char, start: i, end: i + 1 });
      i++;
      continue;
    }

    throw new CelSyntaxError(`Unexpected character "${char}"`, i, 1);
  }

  tokens.push({ type: "eof", value: "", start: n, end: n });
  return tokens;
}

class CelParser {
  private tokens: Token[];
  private pos = 0;

  constructor(
    tokens: Token[],
    private expression: string,
    private completions: CelField[],
  ) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private next(): Token {
    const t = this.tokens[this.pos];
    if (t.type !== "eof") this.pos++;
    return t;
  }

  private expectPunct(value: string): Token {
    const t = this.peek();
    if (t.type === "punct" && t.value === value) {
      return this.next();
    }
    throw new CelSyntaxError(
      `Expected "${value}"${t.type === "eof" ? " but reached end of expression" : ` but found "${t.value}"`}`,
      t.start,
      Math.max(1, t.end - t.start),
    );
  }

  private isPunct(value: string): boolean {
    const t = this.peek();
    return t.type === "punct" && t.value === value;
  }

  // Each parse method returns whether the expression it just parsed is
  // statically known to evaluate to a bool - best-effort, not a real type
  // checker. VEX rules require a bool result (it gates whether the rule
  // applies), so parseProgram rejects anything that isn't recognizably one:
  // comparisons, "in", &&/||, ! negation, the rule helpers, bool literals,
  // or a ternary of two such branches. A bare field access like
  // "vuln.cveId" is a string, not a bool, and must be wrapped in a
  // comparison to be a valid rule.
  parseProgram(): boolean {
    const isBool = this.parseExpr();
    const t = this.peek();
    if (t.type !== "eof") {
      throw new CelSyntaxError(
        `Unexpected token "${t.value}"`,
        t.start,
        Math.max(1, t.end - t.start),
      );
    }
    return isBool;
  }

  private parseExpr(): boolean {
    return this.parseTernary();
  }

  private parseTernary(): boolean {
    const cond = this.parseOr();
    if (this.isPunct("?")) {
      this.next();
      const mid = this.parseExpr();
      this.expectPunct(":");
      const right = this.parseExpr();
      return mid && right;
    }
    return cond;
  }

  // && and || only accept bool operands in CEL, so their result is always a
  // bool - even when an operand is a field we can't type, e.g. ref.defaultBranch.
  private parseOr(): boolean {
    let result = this.parseAnd();
    while (this.isPunct("||")) {
      this.next();
      this.parseAnd();
      result = true;
    }
    return result;
  }

  private parseAnd(): boolean {
    let result = this.parseRelational();
    while (this.isPunct("&&")) {
      this.next();
      this.parseRelational();
      result = true;
    }
    return result;
  }

  private static RELOPS = ["==", "!=", "<", "<=", ">", ">="];

  private parseRelational(): boolean {
    const left = this.parseAdditive();
    const t = this.peek();
    if (t.type === "punct" && CelParser.RELOPS.includes(t.value)) {
      this.next();
      this.parseAdditive();
      return true;
    } else if (t.type === "ident" && t.value === "in") {
      this.next();
      this.parseAdditive();
      return true;
    }
    return left;
  }

  private parseAdditive(): boolean {
    let result = this.parseMultiplicative();
    while (this.isPunct("+") || this.isPunct("-")) {
      this.next();
      this.parseMultiplicative();
      result = false;
    }
    return result;
  }

  private parseMultiplicative(): boolean {
    let result = this.parseUnary();
    while (this.isPunct("*") || this.isPunct("/") || this.isPunct("%")) {
      this.next();
      this.parseUnary();
      result = false;
    }
    return result;
  }

  private parseUnary(): boolean {
    if (this.isPunct("!")) {
      this.next();
      this.parseUnary();
      return true;
    }
    if (this.isPunct("-")) {
      this.next();
      this.parseUnary();
      return false;
    }
    return this.parsePostfix();
  }

  private parsePostfix(): boolean {
    let isBool = this.parsePrimary();
    for (;;) {
      if (this.isPunct(".")) {
        this.next();
        const t = this.peek();
        if (t.type !== "ident") {
          throw new CelSyntaxError(
            'Expected a field or method name after "."',
            t.start,
            Math.max(1, t.end - t.start),
          );
        }
        this.next();
        const path = propertyPathBefore(this.expression, t.start);
        const fields = resolveFields(
          this.completions,
          path,
          this.expression.slice(0, t.start),
        );
        if (fields && !fields.some((f) => f.label === t.value)) {
          const match = fields.find(
            (f) => f.label.toLowerCase() === t.value.toLowerCase(),
          );
          throw new CelSyntaxError(
            match
              ? `Did you mean "${match.label}"?`
              : `"${t.value}" is not a valid property of ${path.join(".")}`,
            t.start,
            t.end - t.start,
          );
        }
        if (this.isPunct("(")) {
          this.next();
          this.parseArgs();
          this.expectPunct(")");
          isBool = BOOL_METHODS.includes(t.value);
          continue;
        }
        // a field access changes the type to something we don't
        // statically know - treat it as non-bool until compared
        isBool = false;
        continue;
      }
      if (this.isPunct("[")) {
        this.next();
        this.parseExpr();
        this.expectPunct("]");
        isBool = false;
        continue;
      }
      break;
    }
    return isBool;
  }

  private parseArgs(): void {
    if (this.isPunct(")")) return;
    this.parseExpr();
    while (this.isPunct(",")) {
      this.next();
      this.parseExpr();
    }
  }

  private parsePrimary(): boolean {
    const t = this.peek();

    if (t.type === "bool") {
      this.next();
      return true;
    }

    if (t.type === "number" || t.type === "string" || t.type === "null") {
      this.next();
      return false;
    }

    if (t.type === "ident") {
      const isCall =
        this.tokens[this.pos + 1]?.type === "punct" &&
        this.tokens[this.pos + 1].value === "(";

      // Only the rule helpers are known to return a bool - everything else
      // (bare identifiers, other calls) is treated as non-bool until compared.
      const isBool = isCall && BOOL_FUNCTIONS.includes(t.value);

      this.next();
      // qualified identifiers, e.g. vuln.cve.cvss, are handled by "." in parsePostfix
      if (this.isPunct("(")) {
        this.next();
        this.parseArgs();
        this.expectPunct(")");
      }
      return isBool;
    }

    if (this.isPunct("(")) {
      this.next();
      const isBool = this.parseExpr();
      this.expectPunct(")");
      return isBool;
    }

    if (this.isPunct("[")) {
      this.next();
      if (!this.isPunct("]")) {
        this.parseExpr();
        while (this.isPunct(",")) {
          this.next();
          if (this.isPunct("]")) break; // allow trailing comma
          this.parseExpr();
        }
      }
      this.expectPunct("]");
      return false;
    }

    if (this.isPunct("{")) {
      this.next();
      if (!this.isPunct("}")) {
        this.parseMapEntry();
        while (this.isPunct(",")) {
          this.next();
          if (this.isPunct("}")) break; // allow trailing comma
          this.parseMapEntry();
        }
      }
      this.expectPunct("}");
      return false;
    }

    throw new CelSyntaxError(
      t.type === "eof"
        ? "Unexpected end of expression"
        : `Unexpected token "${t.value}"`,
      t.start,
      Math.max(1, t.end - t.start),
    );
  }

  private parseMapEntry(): void {
    this.parseExpr();
    this.expectPunct(":");
    this.parseExpr();
  }
}

/**
 * Validates a single CEL expression's syntax. Returns an error description
 * (message + character offset/length within the expression) or null if valid.
 */
export function checkCelSyntax(
  expression: string,
  completions = VEX_RULE_COMPLETIONS,
): { message: string; pos: number; length: number } | null {
  try {
    const tokens = tokenize(expression);
    if (tokens.length === 1) return null; // only EOF -> empty/comment-only line
    const isBool = new CelParser(
      tokens,
      expression,
      completions,
    ).parseProgram();
    if (!isBool) {
      return {
        message:
          "Expression must evaluate to a bool, e.g. via ==, !=, &&, || or a function returning a bool",
        pos: 0,
        length: expression.length,
      };
    }
    return null;
  } catch (e) {
    if (e instanceof CelSyntaxError) {
      return { message: e.message, pos: e.pos, length: e.length };
    }
    return {
      message: "Invalid CEL expression",
      pos: 0,
      length: expression.length,
    };
  }
}

export function celParseLinter(completions: CelField[]) {
  return (view: EditorView): Diagnostic[] => {
    const text = view.state.doc.toString();
    if (text.trim() === "") return [];

    const error = checkCelSyntax(text, completions);
    if (!error) return [];

    return [
      {
        from: error.pos,
        to: Math.min(text.length, error.pos + error.length),
        severity: "error",
        message: error.message,
      },
    ];
  };
}

// A completion which can be followed by "." - fields are the completions after
// the dot, elementFields those of a list's elements, bound by macros like
// otherRefs.all(other, other.<here>).
export type CelField = Completion & {
  fields?: CelField[];
  elementFields?: CelField[];
};

const STRING_METHODS: CelField[] = [
  {
    label: "contains",
    type: "method",
    detail: "(string) -> bool",
    apply: 'contains("")',
  },
  {
    label: "startsWith",
    type: "method",
    detail: "(string) -> bool",
    apply: 'startsWith("")',
  },
  {
    label: "endsWith",
    type: "method",
    detail: "(string) -> bool",
    apply: 'endsWith("")',
  },
  {
    label: "matches",
    type: "method",
    detail: "(regex) -> bool",
    apply: 'matches("")',
  },
  { label: "size", type: "method", detail: "() -> int", apply: "size()" },
];

// Mirrors dtos.RiskMetrics as seen through the CEL "vuln.cve.risk" map.
const RISK_FIELDS: CelField[] = [
  { label: "baseScore", type: "property", detail: "number" },
  { label: "withEnvironment", type: "property", detail: "number" },
  { label: "withThreatIntelligence", type: "property", detail: "number" },
  {
    label: "withEnvironmentAndThreatIntelligence",
    type: "property",
    detail: "number",
  },
];

// Mirrors models.CVE.ToCELMap() (devguard/database/models/cve_model.go) -
// only the fields that map actually exposes.
const CVE_FIELDS: CelField[] = [
  { label: "id", type: "property", detail: "number" },
  { label: "contentHash", type: "property", detail: "number" },
  {
    label: "cve",
    type: "property",
    detail: "string",
    info: "CVE identifier, e.g. CVE-2021-1234",
  },
  { label: "datePublished", type: "property", detail: "string (RFC3339)" },
  {
    label: "dateLastModified",
    type: "property",
    detail: "string (RFC3339)",
  },
  { label: "description", type: "property", detail: "string" },
  { label: "cvss", type: "property", detail: "number" },
  { label: "references", type: "property", detail: "string" },
  { label: "vector", type: "property", detail: "string" },
  {
    label: "risk",
    type: "property",
    detail: "map",
    info: "Nested risk metrics - type . again for its fields",
    fields: RISK_FIELDS,
  },
  {
    label: "cisaRequiredAction",
    type: "property",
    detail: "string | null",
  },
  {
    label: "cisaVulnerabilityName",
    type: "property",
    detail: "string | null",
  },
  { label: "epss", type: "property", detail: "number | null" },
  { label: "percentile", type: "property", detail: "number | null" },
  {
    label: "cisaExploitAdd",
    type: "property",
    detail: "string (date) | null",
  },
  {
    label: "cisaActionDue",
    type: "property",
    detail: "string (date) | null",
  },
  {
    label: "euvdExploitAdd",
    type: "property",
    detail: "string (date) | null",
  },
  {
    label: "cwes",
    type: "property",
    detail: "list<string>",
    info: 'CWE ids, e.g. "CWE-79" in vuln.cve.cwes',
  },
  { label: "exploits", type: "property", detail: "list<map>" },
  { label: "affectedComponents", type: "property", detail: "list" },
  { label: "relationships", type: "property", detail: "list" },
];

// Mirrors models.DependencyVuln.ToCELMap() plus the "artifactPurls" field
// vexrules.vulnToCELMap adds on top of it - only the fields actually exposed
// to the CEL environment used for VEX rule matching.
const VULN_FIELDS: CelField[] = [
  { label: "id", type: "property", detail: "string" },
  { label: "assetVersionName", type: "property", detail: "string" },
  { label: "vulnAssetId", type: "property", detail: "string" },
  { label: "state", type: "property", detail: "string" },
  { label: "lastDetected", type: "property", detail: "string (RFC3339)" },
  { label: "manualTicketCreation", type: "property", detail: "bool" },
  { label: "createdAt", type: "property", detail: "string (RFC3339)" },
  { label: "updatedAt", type: "property", detail: "string (RFC3339)" },
  { label: "cveId", type: "property", detail: "string" },
  {
    label: "cve",
    type: "property",
    detail: "map | null",
    info: "Nested CVE object - type . again for its fields",
    fields: CVE_FIELDS,
  },
  { label: "componentPurl", type: "property", detail: "string" },
  {
    label: "vulnerabilityPath",
    type: "property",
    detail: "list<string>",
  },
  {
    label: "riskRecalculatedAt",
    type: "property",
    detail: "string (RFC3339)",
  },
  {
    label: "lastStateChange",
    type: "property",
    detail: "string (RFC3339) | null",
  },
  { label: "signature", type: "property", detail: "number" },
  { label: "assetSignature", type: "property", detail: "number" },
  { label: "message", type: "property", detail: "string | null" },
  { label: "ticketId", type: "property", detail: "string | null" },
  { label: "ticketUrl", type: "property", detail: "string | null" },
  {
    label: "componentFixedVersion",
    type: "property",
    detail: "string | null",
    info: 'The bare version of the vulnerable component itself that resolves this vuln, e.g. "4.17.21" - null while no fix has been published',
  },
  {
    label: "directDependencyFixedVersion",
    type: "property",
    detail: "string | null",
    info: 'A purl for the direct dependency to bump instead, e.g. "pkg:npm/web@1.2.0", resolved by walking the dependency path - null while unresolved, even if componentFixedVersion is set',
  },
  { label: "riskAssessment", type: "property", detail: "number | null" },
  {
    label: "artifactPurls",
    type: "property",
    detail: "list<string>",
    info: "The purls identifying this vuln's artifacts, used internally by matchesPattern()",
  },
];

const NOW_COMPLETION: CelField = {
  label: "now",
  type: "function",
  detail: "() -> timestamp",
  info: "Returns the current time in RFC3339 format, e.g. 2023-01-02T15:04:05Z",
  apply: "now()",
};

const TIMESTAMP_COMPLETION: CelField = {
  label: "timestamp",
  type: "function",
  detail: "(string) -> timestamp",
  info: 'Parses a timestamp string in RFC3339 format, e.g. timestamp("2023-01-02T15:04:05Z")',
  apply: 'timestamp("")',
};

const DURATION_COMPLETION: CelField = {
  label: "duration",
  type: "function",
  detail: "(string) -> duration",
  info: 'Parses a duration string, e.g. duration("72h")',
  apply: 'duration("")',
};

export const VEX_RULE_COMPLETIONS: CelField[] = [
  {
    label: "vuln",
    type: "variable",
    detail: "map",
    info: "The vulnerability being evaluated",
    fields: VULN_FIELDS,
  },
  {
    label: "matchesPattern",
    type: "function",
    detail: "(vuln, pattern) -> bool",
    info: "Matches vuln's dependency path (and artifact purls) against a path pattern",
    apply: "matchesPattern(vuln, )",
  },
  NOW_COMPLETION,
  TIMESTAMP_COMPLETION,
  DURATION_COMPLETION,
  {
    label: "matchesPurl",
    type: "function",
    detail: "(purl, patternPurl) -> bool",
    info: 'Matches a purl against a purl whose version is a semver constraint, e.g. matchesPurl(vuln.componentPurl, "pkg:npm/undici@6.26.*")',
    apply: 'matchesPurl(vuln.componentPurl, "")',
  },
];

// Mirrors models.AssetVersion.ToCELMap() (devguard/database/models/asset_version_model.go).
export const REF_FIELDS: CelField[] = [
  {
    label: "name",
    type: "property",
    detail: "string",
    info: 'The branch or tag name, e.g. "main" or "v1.2.3"',
  },
  { label: "slug", type: "property", detail: "string" },
  {
    label: "type",
    type: "property",
    detail: '"branch" | "tag"',
    info: 'Either "branch" or "tag"',
  },
  {
    label: "defaultBranch",
    type: "property",
    detail: "bool",
    info: "Whether this is the default branch - it is always kept",
  },
  { label: "createdAt", type: "property", detail: "string (RFC3339)" },
  { label: "updatedAt", type: "property", detail: "string (RFC3339)" },
  {
    label: "lastUploadAt",
    type: "property",
    detail: "string (RFC3339), may be absent",
    info: 'When a client last uploaded a scan (SBOM or SARIF) - absent if it never did, so guard it: has(ref.lastUploadAt) && timestamp(ref.lastUploadAt) > now() - duration("168h")',
  },
];

const SEMVER_FIELDS: CelField[] = [
  { label: "major", type: "property", detail: "int" },
  { label: "minor", type: "property", detail: "int" },
  { label: "patch", type: "property", detail: "int" },
  { label: "prerelease", type: "property", detail: "string" },
];

// Mirrors celrules.assetVersionCelEnv (devguard/celrules/asset_version_rules.go).
export const ASSET_VERSION_COMPLETIONS: CelField[] = [
  {
    label: "ref",
    type: "variable",
    detail: "map",
    info: "The branch or tag being evaluated - return true to keep it",
    fields: REF_FIELDS,
  },
  {
    label: "otherRefs",
    type: "variable",
    detail: "list<map>",
    info: "All other branches and tags of this repository, e.g. otherRefs.all(other, ...)",
    elementFields: REF_FIELDS,
  },
  NOW_COMPLETION,
  TIMESTAMP_COMPLETION,
  DURATION_COMPLETION,
  {
    label: "semver",
    type: "function",
    detail: "(string) -> semver",
    info: 'Parses a semantic version, e.g. semver(ref.name) >= semver("v1.0.0") - fails for non-semver names, use isSemver() first',
    apply: "semver(ref.name)",
    fields: SEMVER_FIELDS,
  },
  {
    label: "isSemver",
    type: "function",
    detail: "(string) -> bool",
    info: 'Whether the string is a semantic version, e.g. isSemver("v1.2.3")',
    apply: "isSemver(ref.name)",
  },
  {
    label: "has",
    type: "function",
    detail: "(field) -> bool",
    info: "Whether a field is present, e.g. has(ref.lastUploadAt)",
    apply: "has(ref.lastUploadAt)",
  },
];

function propertyPathBefore(text: string, pos: number): string[] {
  let i = pos;
  const parts: string[] = [];
  while (i > 0) {
    // skip the "." that separates the previous identifier
    if (text[i - 1] !== ".") break;
    i--;
    // skip a call's arguments, so semver(ref.name).<here> completes the
    // fields of the call's result
    if (text[i - 1] === ")") {
      let depth = 0;
      while (i > 0) {
        i--;
        if (text[i] === ")") depth++;
        else if (text[i] === "(" && --depth === 0) break;
      }
    }
    const end = i;
    while (i > 0 && /[a-zA-Z0-9_]/.test(text[i - 1])) i--;
    const ident = text.slice(i, end);
    if (!ident) break;
    parts.unshift(ident);
  }
  return parts;
}

// A list macro call up to its variable, e.g. ".all(other," - the variable is captured.
const LIST_MACRO_CALL =
  /\.(?:all|exists|exists_one|filter|map)\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,/g;

function findField(fields: CelField[], label: string) {
  return fields.find((f) => f.label === label);
}

// Resolves the fields available after a property path. A root which isn't a
// top-level completion may be a macro variable, e.g. "other" in
// otherRefs.filter(o, o.type == "tag").all(other, other.<here>).
function resolveFields(
  completions: CelField[],
  path: string[],
  textBefore: string,
): CelField[] | undefined {
  let field = findField(completions, path[0]);
  let fields = field?.fields;
  if (!field) {
    const macro = [...textBefore.matchAll(LIST_MACRO_CALL)]
      .filter((match) => match[1] === path[0])
      .at(-1);
    if (!macro) return undefined;
    // filter() keeps the list's element type, so it is skipped
    const listPath = propertyPathBefore(textBefore, macro.index + 1).filter(
      (part) => part !== "filter",
    );
    let list =
      listPath.length > 0 ? findField(completions, listPath[0]) : undefined;
    for (const part of listPath.slice(1)) {
      list = list?.fields && findField(list.fields, part);
    }
    fields = list?.elementFields;
  }
  for (const part of path.slice(1)) {
    field = fields && findField(fields, part);
    fields =
      field?.fields ??
      (field?.detail?.startsWith("string") ? STRING_METHODS : undefined);
  }
  return fields;
}

export function createCelCompletionSource(completions: CelField[]) {
  return (context: CompletionContext): CompletionResult | null => {
    const wordMatch = context.matchBefore(/[a-zA-Z0-9_]*/);
    const from = wordMatch ? wordMatch.from : context.pos;

    const textBeforeWord = context.state.sliceDoc(0, from);
    const path = propertyPathBefore(textBeforeWord, from);

    if (path.length > 0) {
      const options = resolveFields(completions, path, textBeforeWord);
      if (!options) return null;
      return { from, options, validFor: /^[a-zA-Z0-9_]*$/ };
    }

    if (!wordMatch || (wordMatch.from === wordMatch.to && !context.explicit)) {
      return null;
    }

    return {
      from,
      options: completions,
      validFor: /^[a-zA-Z0-9_]*$/,
    };
  };
}

export const celCompletionSource =
  createCelCompletionSource(VEX_RULE_COMPLETIONS);

export const assetVersionCelCompletionSource = createCelCompletionSource(
  ASSET_VERSION_COMPLETIONS,
);
