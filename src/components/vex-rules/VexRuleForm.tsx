// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CelCodeBlock from "@/components/common/CelCodeBlock";
import { checkCelSyntax } from "@/components/common/celLinter";
import { browserApiClient } from "@/services/devGuardApi";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import { ChevronDown, ChevronRight, Scissors } from "lucide-react";
import dynamic from "next/dynamic";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { FunctionComponent } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Input } from "../ui/input";
import {
  analyzeVexRuleEffect,
  resolveCut,
  type VexRuleEffect,
  type VexRuleVulnContext,
} from "./vexRuleParser";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

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
  // "full": title input + editable CEL expression (the expert flow).
  // "reduced": focuses the effect on the current vulnerability; the generated CEL
  // expression is collapsed and read-only (still copyable), the title is inherited.
  variant?: "full" | "reduced";
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
  variant = "full",
}) => {
  const isReduced = variant === "reduced";
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

  // What to render for this rule/vuln combination — the parser decides the kind
  // of effect and where (if anywhere) the rule severs the dependency path.
  const effect: VexRuleEffect = useMemo(
    () =>
      currentVuln && !hasSyntaxError
        ? analyzeVexRuleEffect(celExpression, currentVuln)
        : { type: "indeterminate", applies: null, cutIndex: -1 },
    [celExpression, currentVuln, hasSyntaxError],
  );

  // Everything from the cut node down is unreachable (rendered dismissed).
  const cutIndex = effect.cutIndex;
  const cut = currentVuln ? resolveCut(currentVuln, cutIndex) : null;
  const attributeLabel = effect.matchedOn
    ? effect.matchedOn.field === "cveId"
      ? effect.matchedOn.value
      : beautifyPurl(effect.matchedOn.value)
    : "";

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

  // Shared status lines below the CEL expression — kept visible in both variants.
  const celStatus = (
    <>
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
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        {!isReduced && (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">Title</label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
        )}

        {currentVuln && (
          <div className={isReduced ? "" : "mt-2"}>
            <span className="text-sm font-semibold">
              Effect on the current vulnerability
            </span>
            <div
              className={classNames(
                "rounded-lg border p-3 mt-2",
                isReduced ? "border-border bg-card" : "bg-muted/30",
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <PathChip label={currentVuln.rootName} isRoot />
                {currentVuln.vulnerabilityPath.map((purl, i) => (
                  <Fragment key={purl + i}>
                    <PathConnector
                      cut={i === cutIndex}
                      dimmed={cutIndex >= 0 && i > cutIndex}
                      title={
                        i === cutIndex && cut
                          ? `${cut.parent} does not call the vulnerable function of ${cut.child}`
                          : undefined
                      }
                    />
                    <PathChip
                      label={purl}
                      vulnerable={
                        i === currentVuln.vulnerabilityPath.length - 1
                      }
                      dismissed={cutIndex >= 0 && i >= cutIndex}
                    />
                  </Fragment>
                ))}
              </div>
              {effect.type === "pathCut" && cut ? (
                <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground ml-0.5">
                  <span>
                    <span className="font-medium text-foreground">
                      {cut.parent}
                    </span>{" "}
                    does not call the vulnerable function of{" "}
                    <span className="font-medium text-foreground">
                      {cut.child}
                    </span>
                    .
                  </span>
                </p>
              ) : effect.type === "pathIntact" ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  This rule leaves the path intact — it doesn&apos;t apply to
                  this vulnerability.
                </p>
              ) : effect.type === "attributeMatch" ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  This rule dismisses the vulnerability on every path, because
                  it matches {attributeLabel}.
                </p>
              ) : effect.type === "attributeMiss" ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  This rule matches {attributeLabel} — not this vulnerability.
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  This expression can&apos;t be previewed for a single
                  vulnerability — rely on the ref-wide match count below.
                </p>
              )}
            </div>
          </div>
        )}

        {isReduced ? (
          <div className="mt-6">
            <Collapsible>
              <CollapsibleTrigger className="group flex w-full cursor-pointer flex-row items-center justify-between text-sm font-semibold">
                Matching rule (CEL expression)
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <CelCodeBlock value={celExpression} readOnly />
              </CollapsibleContent>
            </Collapsible>
            {celStatus}
          </div>
        ) : (
          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold">
              CEL expression
            </label>
            <CelCodeBlock
              value={celExpression}
              onChange={onCelExpressionChange}
              height={140}
              placeholder={`// Examples:\n// vuln.cveId == "CVE-2021-1234"\n// vuln.componentPurl.startsWith("pkg:npm/lodash")\n// vuln.cve.cvss < 4.0\n// ROOT is a special token matching all artifacts in a repo\n// matchesPattern(vuln, ["*", "pkg:npm/foo@1.0.0", "pkg:npm/lodash@4.17.21"])`}
            />
            {celStatus}
          </div>
        )}
      </div>

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
