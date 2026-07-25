// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CelCodeBlock from "@/components/common/CelCodeBlock";
import { checkCelSyntax } from "@/components/common/celLinter";
import { browserApiClient } from "@/services/devGuardApi";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import {
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleX,
  Scissors,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { FunctionComponent } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

export interface VexRuleVulnContext {
  cveID: string | null;
  componentPurl: string;
  // Ordered purls from the direct dependency down to the vulnerable component.
  vulnerabilityPath: string[];
  // Application / asset name rendered as the first (root) node.
  rootName: string;
}

// Extracts the array from a `matchesPattern(vuln, [...])` call, if present.
function extractPathPattern(cel: string): string[] | null {
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

// The concrete (non-"*") pattern segments must appear as a contiguous suffix of the path.
function matchPatternSuffix(
  path: string[],
  pattern: string[],
): { matches: boolean; fromIndex: number } {
  const concrete = pattern.filter((segment) => segment !== "*");
  if (concrete.length === 0) return { matches: true, fromIndex: 0 };
  if (concrete.length > path.length) return { matches: false, fromIndex: -1 };
  const fromIndex = path.length - concrete.length;
  const matches = concrete.every(
    (segment, i) => segment === path[fromIndex + i],
  );
  return { matches, fromIndex: matches ? fromIndex : -1 };
}

// Best-effort, client-side evaluation of whether a rule applies to one specific vuln.
// The backend /test endpoint only returns a ref-wide count, so this covers the common,
// statically decidable shapes this flow produces (path patterns, cveId / componentPurl
// checks). Combined expressions (&&, ||) return `null` — "can't tell locally".
export function evaluateAgainstVuln(
  cel: string,
  vuln: VexRuleVulnContext,
): { verdict: boolean | null; coveredFromIndex: number } {
  const expr = cel.trim();
  const unknown = { verdict: null, coveredFromIndex: -1 };
  if (!expr || /&&|\|\|/.test(expr)) return unknown;

  const pattern = extractPathPattern(expr);
  if (pattern) {
    const { matches, fromIndex } = matchPatternSuffix(
      vuln.vulnerabilityPath,
      pattern,
    );
    return { verdict: matches, coveredFromIndex: fromIndex };
  }

  const cve = expr.match(/vuln\.cveId\s*==\s*["']([^"']+)["']/);
  if (cve) return { verdict: cve[1] === vuln.cveID, coveredFromIndex: -1 };

  const purlEquals = expr.match(/vuln\.componentPurl\s*==\s*["']([^"']+)["']/);
  if (purlEquals)
    return {
      verdict: purlEquals[1] === vuln.componentPurl,
      coveredFromIndex: -1,
    };

  const purlStartsWith = expr.match(
    /vuln\.componentPurl\.startsWith\(\s*["']([^"']+)["']\s*\)/,
  );
  if (purlStartsWith)
    return {
      verdict: vuln.componentPurl.startsWith(purlStartsWith[1]),
      coveredFromIndex: -1,
    };

  return unknown;
}

const PathChip: FunctionComponent<{
  label: string;
  isRoot?: boolean;
  vulnerable?: boolean;
  // The rule cut the path above this node, so it is no longer reachable.
  dismissed?: boolean;
}> = ({ label, isRoot, vulnerable, dismissed }) => {
  const name = isRoot ? label : beautifyPurl(label);
  const version = isRoot ? "" : extractVersion(label);
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-sm",
        dismissed
          ? "border-dashed border-muted-foreground/30 text-muted-foreground/70 line-through"
          : vulnerable
            ? "border-destructive/40 text-destructive"
            : "border-muted-foreground/40 text-foreground",
      )}
    >
      <span className="max-w-[10rem] truncate">{name}</span>
      {version && <span className="opacity-70">{version}</span>}
    </span>
  );
};

// The connector between two path nodes: a plain arrow, a dimmed arrow (past the
// cut), or a scissors "cut" mark where the rule severs the path.
const PathConnector: FunctionComponent<{
  cut?: boolean;
  dimmed?: boolean;
  title?: string;
}> = ({ cut, dimmed, title }) => {
  if (cut) {
    return (
      <span
        title={title}
        className="inline-flex items-center gap-0.5 text-destructive"
      >
        <span className="h-px w-2 border-t border-dashed border-destructive/60" />
        <Scissors className="h-3.5 w-3.5" />
        <span className="h-px w-2 border-t border-dashed border-destructive/60" />
      </span>
    );
  }
  return (
    <ChevronRight
      className={classNames(
        "h-3 w-3 shrink-0",
        dimmed ? "text-muted-foreground/40" : "text-muted-foreground",
      )}
    />
  );
};

interface VexRuleFormProps {
  baseUrl: string;
  title: string;
  onTitleChange: (title: string) => void;
  celExpression: string;
  onCelExpressionChange: (celExpression: string) => void;
  justification: string;
  onJustificationChange: (justification: string) => void;
  // When present, the form previews the rule's effect on this specific vulnerability.
  currentVuln?: VexRuleVulnContext;
}

const VexRuleForm: FunctionComponent<VexRuleFormProps> = ({
  baseUrl,
  title,
  onTitleChange,
  celExpression,
  onCelExpressionChange,
  justification,
  onJustificationChange,
  currentVuln,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    expr: string;
    count: number;
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [testingError, setTestingError] = useState<string | null>(null);

  const syntaxError =
    celExpression.trim() !== "" ? checkCelSyntax(celExpression) : null;
  const hasSyntaxError = syntaxError !== null;

  // Only surface a count that belongs to the current expression, so a stale
  // result never lingers while the user edits (avoids a setState in the effect).
  const matchCount =
    !hasSyntaxError && matchResult?.expr === celExpression.trim()
      ? matchResult.count
      : null;

  const vulnEffect = useMemo(
    () =>
      currentVuln && !hasSyntaxError
        ? evaluateAgainstVuln(celExpression, currentVuln)
        : { verdict: null as boolean | null, coveredFromIndex: -1 },
    [celExpression, currentVuln, hasSyntaxError],
  );

  // Where the rule severs the path. The cut sits on the edge entering the
  // matched suffix; everything from there down is unreachable (dismissed).
  const path = currentVuln?.vulnerabilityPath ?? [];
  const cutIndex =
    vulnEffect.verdict === true && path.length > 0
      ? vulnEffect.coveredFromIndex >= 0
        ? vulnEffect.coveredFromIndex
        : path.length - 1
      : -1;
  const cutParent =
    cutIndex > 0
      ? beautifyPurl(path[cutIndex - 1])
      : (currentVuln?.rootName ?? "");
  const cutChild = cutIndex >= 0 ? beautifyPurl(path[cutIndex]) : "";

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const expression = celExpression.trim();
    if (!expression || hasSyntaxError) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsTesting(true);
      try {
        const resp = await browserApiClient(baseUrl + "/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            celExpression: [expression],
          }),
        });

        if (!resp.ok) {
          setTestingError("Failed to test CEL expression");
          return;
        } else {
          setTestingError(null);
        }

        const data: Record<string, number> = await resp.json();
        setMatchResult({ expr: expression, count: data[expression] ?? 0 });
      } finally {
        setIsTesting(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [celExpression, hasSyntaxError, baseUrl]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold">Title</label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <label className="mb-2 block text-sm font-semibold">
          CEL expression
        </label>
        <CelCodeBlock
          value={celExpression}
          onChange={onCelExpressionChange}
          height={110}
          placeholder={`// examples:\n// vuln.cveId == "CVE-2021-1234"\n// vuln.componentPurl.startsWith("pkg:npm/lodash")\n// vuln.cve.cvss < 4.0\n// matchesPattern(vuln, ["*", "pkg:npm/lodash@4.17.21"])`}
        />
        {syntaxError || testingError ? (
          <p className="mt-1 text-xs text-destructive">
            {syntaxError?.message ?? testingError ?? "Unknown error"}
          </p>
        ) : null}
        {!hasSyntaxError && isTesting && (
          <p className="mt-1 text-xs text-muted-foreground">
            Checking how many vulnerabilities this would affect...
          </p>
        )}
        {!hasSyntaxError && !isTesting && matchCount !== null && (
          <p
            className={
              "mt-1 text-xs " +
              (matchCount > 0 ? "text-success" : "text-muted-foreground")
            }
          >
            Matches {matchCount} vulnerabilit
            {matchCount === 1 ? "y" : "ies"} in this ref
          </p>
        )}
      </div>

      {currentVuln && (
        <div className="mt-2">
          <span className="text-sm font-semibold">
            Effect on the current vulnerability
          </span>
          <div className="rounded-lg border bg-muted/30 p-3 mt-2">
            <div className="mb-2 flex flex-row items-center justify-between gap-2">
              {vulnEffect.verdict === true ? (
                <Badge variant="success" className="gap-1 text-success">
                  <CircleCheck className="h-3.5 w-3.5" />
                  Applies to this vuln
                </Badge>
              ) : vulnEffect.verdict === false ? (
                <Badge variant="yellow" className="gap-1 text-muted-foreground">
                  <CircleX className="h-3.5 w-3.5" />
                  Does not apply
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="gap-1 text-muted-foreground"
                >
                  <CircleHelp className="h-3.5 w-3.5" />
                  See match count
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <PathChip label={currentVuln.rootName} isRoot />
              {currentVuln.vulnerabilityPath.map((purl, i) => (
                <Fragment key={purl + i}>
                  <PathConnector
                    cut={i === cutIndex}
                    dimmed={cutIndex >= 0 && i > cutIndex}
                    title={
                      i === cutIndex
                        ? `${cutParent} does not call the vulnerable function of ${cutChild}`
                        : undefined
                    }
                  />
                  <PathChip
                    label={purl}
                    vulnerable={i === currentVuln.vulnerabilityPath.length - 1}
                    dismissed={cutIndex >= 0 && i >= cutIndex}
                  />
                </Fragment>
              ))}
            </div>
            {cutIndex >= 0 ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Scissors className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                <span>
                  <span className="font-medium text-foreground">
                    {cutParent}
                  </span>{" "}
                  does not call the vulnerable function of{" "}
                  <span className="font-medium text-foreground">
                    {cutChild}
                  </span>
                  .
                </span>
              </p>
            ) : vulnEffect.verdict === false ? (
              <p className="mt-2 text-xs text-muted-foreground">
                This rule leaves the path intact — it doesn&apos;t apply to this
                vulnerability.
              </p>
            ) : vulnEffect.verdict === null ? (
              <p className="mt-2 text-xs text-muted-foreground">
                This expression can&apos;t be previewed for a single
                vulnerability — rely on the ref-wide match count above.
              </p>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold">
          Justification
        </label>
        <MarkdownEditor
          className="!bg-card"
          placeholder="Add your comment here..."
          value={justification}
          setValue={(value) => onJustificationChange(value ?? "")}
          maxLength={4000}
        />
      </div>
    </div>
  );
};

export default VexRuleForm;
export { type VexRuleFormProps };
