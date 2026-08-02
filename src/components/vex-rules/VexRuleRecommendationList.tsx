// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Button } from "@/components/ui/button";
import type { VexRuleRecommendation } from "@/types/api/api";
import { classNames } from "@/utils/common";
import type { FunctionComponent } from "react";
import VexRuleMatchStatus from "./VexRuleMatchStatus";
import VexRuleResult from "./VexRuleResult";
import { extractVulnIdentifier } from "./vexRuleParser";
import { Badge } from "../ui/badge";
import { VerifiedIcon } from "lucide-react";

export interface RecommendationEntry {
  vulnID: string;
  recommendation: VexRuleRecommendation;
}

interface VexRuleRecommendationListProps {
  recommendations: RecommendationEntry[];
  onCreateRule: (entry: RecommendationEntry) => void;
}

/** Vulnerabilities other organizations have already assessed, one row each. */
const VexRuleRecommendationList: FunctionComponent<
  VexRuleRecommendationListProps
> = ({ recommendations, onCreateRule }) => (
  <ul className="flex flex-col divide-y rounded-lg border">
    {recommendations.map((entry, index) => {
      return (
        <li
          key={entry.vulnID}
          onClick={() => onCreateRule(entry)}
          className={classNames(
            "flex cursor-pointer flex-row flex-wrap items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/50",
            index % 2 !== 0 && "bg-card/50",
          )}
        >
          <div className="flex min-w-0 flex-col gap-1">
            {entry.recommendation.type === "session" && (
              <span className="text-xs text-muted-foreground">
                Created by your organization
              </span>
            )}
            {entry.recommendation.type == "upstream" && (
              <span className="text-xs text-muted-foreground flex flex-row items-center gap-1">
                <VerifiedIcon size={14} /> Synced from official sources
                {entry.recommendation.source && (
                  <span className="text-xs text-muted-foreground">
                    ({entry.recommendation.source})
                  </span>
                )}
              </span>
            )}
            <span className="text-sm font-medium">
              {entry.recommendation.title}
            </span>
            {entry.recommendation.justification && (
              <span className="truncate text-xs text-muted-foreground">
                {entry.recommendation.justification}
              </span>
            )}
          </div>
          <div className="flex flex-row items-center gap-3">
            <VexRuleResult
              eventType={entry.recommendation.eventType}
              mechanicalJustification={
                entry.recommendation.mechanicalJustification
              }
            />
            <VexRuleMatchStatus
              status={{
                matchCount:
                  entry.recommendation.appliesToAmountOfDependencyVulns,
              }}
            />

            <Button size="sm" variant="secondary">
              Create rule
            </Button>
          </div>
        </li>
      );
    })}
  </ul>
);

export default VexRuleRecommendationList;
