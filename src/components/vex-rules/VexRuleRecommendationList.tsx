// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Button } from "@/components/ui/button";
import type { VexRuleRecommendation } from "@/types/api/api";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { FunctionComponent } from "react";
import VexRuleResult from "./VexRuleResult";
import { extractVulnIdentifier } from "./vexRuleParser";

export interface RecommendationEntry {
  vulnID: string;
  recommendation: VexRuleRecommendation;
}

interface VexRuleRecommendationListProps {
  recommendations: RecommendationEntry[];
  // Page path of this repository's dependency risks, for linking to the vuln.
  dependencyRisksPath: string;
  onCreateRule: (entry: RecommendationEntry) => void;
}

/**
 * Every open vulnerability of this repository that other DevGuard organizations
 * have already assessed. One row each, with the way to adopt it.
 */
const VexRuleRecommendationList: FunctionComponent<
  VexRuleRecommendationListProps
> = ({ recommendations, dependencyRisksPath, onCreateRule }) => (
  <ul className="flex flex-col divide-y rounded-lg border">
    {recommendations.map((entry) => {
      const identifier = extractVulnIdentifier(
        entry.recommendation.celExpression,
      );

      return (
        <li
          key={entry.vulnID}
          className="flex flex-row flex-wrap items-center justify-between gap-3 p-3"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <Link
              href={`${dependencyRisksPath}/${entry.vulnID}`}
              className="flex flex-row items-center gap-1 text-sm font-medium hover:underline"
            >
              {identifier ?? "Open vulnerability"}
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onCreateRule(entry)}
            >
              Create rule
            </Button>
          </div>
        </li>
      );
    })}
  </ul>
);

export default VexRuleRecommendationList;
