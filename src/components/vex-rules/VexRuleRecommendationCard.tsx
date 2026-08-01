// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CelCodeBlock from "@/components/common/CelCodeBlock";
import { Button } from "@/components/ui/button";
import type { VexRuleRecommendation } from "@/types/api/api";
import { removeUnderscores, vexOptionMessages } from "@/utils/view";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Users } from "lucide-react";
import type { FunctionComponent } from "react";
import VexRuleResult from "./VexRuleResult";
import { Badge } from "../ui/badge";

const VERIFIED_CONFIDENCE = 1;

interface VexRuleRecommendationCardProps {
  recommendation: VexRuleRecommendation;
  // Hands the recommendation over to rule creation.
  onCreateRule: () => void;
}

/**
 * A rule other organizations already apply to this vulnerability. Shaped like the
 * "handled by a VEX rule" card, outlined in success — an offer, not a state.
 */
const VexRuleRecommendationCard: FunctionComponent<
  VexRuleRecommendationCardProps
> = ({ recommendation, onCreateRule }) => {
  const mechanical = recommendation.mechanicalJustification;

  return (
    <div className="relative overflow-hidden rounded-lg border border-success bg-card shadow-lg shadow-success/20">
      {/* Subtle dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 invert dark:invert-0"
      />

      <div className="relative z-10 flex flex-col gap-3 p-5">
        <div className="flex flex-row items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
              <Users className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-medium text-muted-foreground">
                {recommendation.assetSlug && recommendation.projectSlug
                  ? "Recommended by your organization"
                  : "Recommended by other DevGuard users"}
              </span>
              <span className="text-base font-semibold">
                {recommendation.assetSlug && recommendation.projectSlug
                  ? "Your organization"
                  : "Other DevGuard users"}{" "}
                assess this vulnerability as not exploitable
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-row items-center gap-2">
            {!recommendation.assetSlug &&
              recommendation.confidence >= VERIFIED_CONFIDENCE && (
                <Badge variant="success" className="gap-1 py-1">
                  <CheckCircleIcon className="h-4 w-4" />
                  Verified
                </Badge>
              )}
            <VexRuleResult
              eventType={recommendation.eventType}
              mechanicalJustification={mechanical}
            />
          </div>
        </div>

        {mechanical && (
          <p className="text-sm text-muted-foreground">
            {vexOptionMessages[mechanical] ?? removeUnderscores(mechanical)}
          </p>
        )}

        {recommendation.justification && (
          <p className="border-l-2 border-border pl-3 text-sm text-muted-foreground">
            {recommendation.justification}
          </p>
        )}

        {recommendation.celExpression && (
          <div className="mt-4">
            <CelCodeBlock
              value={recommendation.celExpression}
              readOnly
              label="Recommended rule (CEL)"
            />
          </div>
        )}

        <div className="mt-2 flex flex-row items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
          <span className="">
            Nothing is applied until you create the rule.
          </span>
          <Button size="sm" onClick={onCreateRule} variant="green">
            Create VEX rule from recommendation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VexRuleRecommendationCard;
