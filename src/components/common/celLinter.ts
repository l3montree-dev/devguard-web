import type { Diagnostic } from "@codemirror/lint";
import type { EditorView } from "codemirror";
import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";

type TokenType =
  "number" | "string" | "ident" | "bool" | "null" | "punct" | "eof";

interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

class CelSyntaxError extends Error {
  pos: number;
  length: number;
  constructor(message: string, pos: number, length = 1) {
    super(message);
    this.pos = pos;
    this.length = length;
  }
}

// The helper functions the VEX rule CEL environment exposes; both return a bool.
const BOOL_FUNCTIONS = ["matchesPattern", "matchesPurl"];

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

  constructor(tokens: Token[]) {
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

  private parseOr(): boolean {
    let result = this.parseAnd();
    while (this.isPunct("||")) {
      this.next();
      const right = this.parseAnd();
      result = result && right;
    }
    return result;
  }

  private parseAnd(): boolean {
    let result = this.parseRelational();
    while (this.isPunct("&&")) {
      this.next();
      const right = this.parseRelational();
      result = result && right;
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
        if (this.isPunct("(")) {
          this.next();
          this.parseArgs();
          this.expectPunct(")");
        }
        // a field/method access changes the type to something we don't
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
): { message: string; pos: number; length: number } | null {
  try {
    const tokens = tokenize(expression);
    if (tokens.length === 1) return null; // only EOF -> empty/comment-only line
    const isBool = new CelParser(tokens).parseProgram();
    if (!isBool) {
      return {
        message:
          "Expression must evaluate to a bool, e.g. via ==, !=, matchesPattern(...) or matchesPurl(...)",
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

export function celParseLinter() {
  return (view: EditorView): Diagnostic[] => {
    const text = view.state.doc.toString();
    if (text.trim() === "") return [];

    const diagnostics: Diagnostic[] = [];
    const lineCount = view.state.doc.lines;

    for (let lineNo = 1; lineNo <= lineCount; lineNo++) {
      const line = view.state.doc.line(lineNo);
      const trimmed = line.text.trim();
      if (trimmed === "" || trimmed.startsWith("//")) continue;

      const error = checkCelSyntax(line.text);
      if (error) {
        diagnostics.push({
          from: line.from + error.pos,
          to: Math.min(line.to, line.from + error.pos + error.length),
          severity: "error",
          message: error.message,
        });
      }
    }

    return diagnostics;
  };
}

// Mirrors dtos.RiskMetrics as seen through the CEL "vuln.cve.risk" map.
const RISK_FIELDS: Completion[] = [
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
const CVE_FIELDS: Completion[] = [
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
  { label: "weaknesses", type: "property", detail: "list<map>" },
  { label: "exploits", type: "property", detail: "list<map>" },
  { label: "affectedComponents", type: "property", detail: "list" },
  { label: "relationships", type: "property", detail: "list" },
];

// Mirrors models.DependencyVuln.ToCELMap() plus the "artifactPurls" field
// vexrules.vulnToCELMap adds on top of it - only the fields actually exposed
// to the CEL environment used for VEX rule matching.
const VULN_FIELDS: Completion[] = [
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

const TOP_LEVEL_COMPLETIONS: Completion[] = [
  {
    label: "vuln",
    type: "variable",
    detail: "map",
    info: "The vulnerability being evaluated",
  },
  {
    label: "matchesPattern",
    type: "function",
    detail: "(vuln, pattern) -> bool",
    info: "Matches vuln's dependency path (and artifact purls) against a path pattern",
    apply: "matchesPattern(vuln, )",
  },
  {
    label: "now",
    type: "function",
    detail: "() -> timestamp",
    info: "Returns the current time in RFC3339 format, e.g. 2023-01-02T15:04:05Z",
    apply: "now()",
  },
  {
    label: "timestamp",
    type: "function",
    detail: "(string) -> timestamp",
    info: 'Parses a timestamp string in RFC3339 format, e.g. timestamp("2023-01-02T15:04:05Z")',
    apply: 'timestamp("")',
  },
  {
    label: "duration",
    type: "function",
    detail: "(string) -> duration",
    info: 'Parses a duration string, e.g. duration("72h")',
    apply: 'duration("")',
  },
  {
    label: "matchesPurl",
    type: "function",
    detail: "(purl, patternPurl) -> bool",
    info: 'Matches a purl against a purl whose version is a semver constraint, e.g. matchesPurl(vuln.componentPurl, "pkg:npm/undici@6.26.*")',
    apply: 'matchesPurl(vuln.componentPurl, "")',
  },
];

function propertyPathBefore(text: string, pos: number): string[] {
  let i = pos;
  const parts: string[] = [];
  while (i > 0) {
    // skip the "." that separates the previous identifier
    if (text[i - 1] !== ".") break;
    i--;
    const end = i;
    while (i > 0 && /[a-zA-Z0-9_]/.test(text[i - 1])) i--;
    const ident = text.slice(i, end);
    if (!ident) break;
    parts.unshift(ident);
  }
  return parts;
}

export function celCompletionSource(
  context: CompletionContext,
): CompletionResult | null {
  const wordMatch = context.matchBefore(/[a-zA-Z0-9_]*/);
  const from = wordMatch ? wordMatch.from : context.pos;

  const textBeforeWord = context.state.sliceDoc(0, from);
  const path = propertyPathBefore(textBeforeWord, from);

  if (path.length > 0) {
    if (path[0] !== "vuln") return null;

    if (path.length === 1) {
      return { from, options: VULN_FIELDS, validFor: /^[a-zA-Z0-9_]*$/ };
    }
    if (path.length === 2 && path[1] === "cve") {
      return { from, options: CVE_FIELDS, validFor: /^[a-zA-Z0-9_]*$/ };
    }
    if (path.length === 3 && path[1] === "cve" && path[2] === "risk") {
      return { from, options: RISK_FIELDS, validFor: /^[a-zA-Z0-9_]*$/ };
    }
    return null;
  }

  if (!wordMatch || (wordMatch.from === wordMatch.to && !context.explicit)) {
    return null;
  }

  return {
    from,
    options: TOP_LEVEL_COMPLETIONS,
    validFor: /^[a-zA-Z0-9_]*$/,
  };
}
