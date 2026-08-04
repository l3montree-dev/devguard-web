// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CelCodeBlock from "@/components/common/CelCodeBlock";
import Purl from "@/components/common/Purl";
import { classNames } from "@/utils/common";
import { ChevronDown, ChevronRight, Scissors } from "lucide-react";
import dynamic from "next/dynamic";
import { Fragment, useMemo } from "react";
import type { FunctionComponent } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Input } from "../ui/input";
import { useVexRuleMatchCount } from "./useVexRuleMatchCount";
import VexRuleMatchStatus from "./VexRuleMatchStatus";
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
  vulnerable?: boolean;
  // The rule cut the path above this node, so it is no longer reachable.
  dismissed?: boolean;
}> = ({ label, vulnerable, dismissed }) => {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm",
        dismissed
          ? "border-dashed border-muted-foreground/30 text-muted-foreground/70 line-through"
          : vulnerable
            ? "border-destructive/40 text-destructive"
            : "border-muted-foreground/40 text-foreground",
      )}
    >
      <Purl purl={label} variant="compact" showQualifiers={false} />
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
  const matchStatus = useVexRuleMatchCount(baseUrl, celExpression);
  const { hasSyntaxError } = matchStatus;

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
  const attributeLabel = effect.matchedOn ? (
    effect.matchedOn.field === "cveId" ? (
      effect.matchedOn.value
    ) : (
      <Purl
        purl={effect.matchedOn.value}
        variant="compact"
        showQualifiers={false}
        className="inline-flex align-middle"
      />
    )
  ) : (
    ""
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        {/* The reduced variant inherits a generated title, but a rule cannot be
            created without one — so the field appears if that title is empty. */}
        {(!isReduced || title.trim() === "") && (
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
                <PathChip label={currentVuln.rootName} />
                {currentVuln.vulnerabilityPath.map((purl, i) => (
                  <Fragment key={purl + i}>
                    <PathConnector
                      cut={i === cutIndex}
                      dimmed={cutIndex >= 0 && i > cutIndex}
                      title={
                        i === cutIndex && cut
                          ? cutIndex === 0
                            ? `No artifact of ${cut.parent} calls the vulnerable function of ${cut.child}`
                            : `${cut.parent} does not call the vulnerable function of ${cut.child}`
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
                  {cutIndex === 0 ? (
                    <span>
                      No artifact of{" "}
                      <span className="font-medium text-foreground">
                        {cut.parent}
                      </span>{" "}
                      calls the vulnerable function of{" "}
                      <span className="font-medium text-foreground">
                        {cut.child}
                      </span>
                      .
                    </span>
                  ) : (
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
                  )}
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
                <CelCodeBlock
                  value={celExpression}
                  onChange={onCelExpressionChange}
                />
              </CollapsibleContent>
            </Collapsible>
            <VexRuleMatchStatus
              status={matchStatus}
              scope="open"
              className="mt-1.5"
            />
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
              placeholder={`// Examples:\n// vuln.cveId == "CVE-2021-1234"\n// matchesPurl(vuln.componentPurl, "pkg:npm/undici@6.26.*")\n// vuln.cve.cvss < 4.0\n// ROOT is a special token matching all artifacts in a repo\n// matchesPattern(vuln, ["*", "pkg:npm/foo@1.0.0", "pkg:npm/lodash@4.17.21"])`}
            />
            <VexRuleMatchStatus
              status={matchStatus}
              scope="open"
              className="mt-1.5"
            />
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold">
          Justification
        </label>
        <MarkdownEditor
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
