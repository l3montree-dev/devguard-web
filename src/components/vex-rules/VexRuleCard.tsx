// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CelCodeBlock from "@/components/common/CelCodeBlock";

import { formatDate } from "@/utils/format";
import { removeUnderscores, vexOptionMessages } from "@/utils/view";
import { Lock } from "lucide-react";
import Link from "next/link";
import type { FunctionComponent } from "react";
import Markdown from "../common/Markdown";
import type { VexRule } from "@/types/view/vexRules";

interface VexRuleCardProps {
  vexRule: VexRule;
  // Optional link to the VEX rules page where the rule can be managed / deleted.
  vexRulesUrl?: string;
}

const VexRuleCard: FunctionComponent<VexRuleCardProps> = ({
  vexRule,
  vexRulesUrl,
}) => {
  const mechanical = vexRule.mechanicalJustification;

  return (
    <div className="relative overflow-hidden rounded-lg border bg-card shadow-lg shadow-primary/20 border-primary">
      {/* Subtle dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 invert dark:invert-0"
        style={{
          backgroundImage: "url(/assets/background/dot-texture.svg)",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 flex flex-col gap-3 p-5">
        <div className="flex flex-row items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-medium text-muted-foreground">
                Handled by a VEX rule
              </span>
              <span className="text-base font-semibold">
                {vexRule.title || "VEX rule"}
              </span>
            </div>
          </div>
        </div>

        {mechanical && (
          <p className="text-sm text-muted-foreground">
            {vexOptionMessages[mechanical] ?? removeUnderscores(mechanical)}
          </p>
        )}

        {vexRule.justification && (
          <div className="border-l-2 border-border pl-3 text-sm text-muted-foreground">
            <Markdown>{vexRule.justification}</Markdown>
          </div>
        )}

        {vexRule.celExpression && (
          <div className="mt-4">
            <CelCodeBlock
              value={vexRule.celExpression}
              readOnly
              label="Matching rule (CEL)"
            />
          </div>
        )}

        <div className="mt-2 flex flex-row flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span>
            Created {formatDate(vexRule.createdAt)}
            {vexRule.vexSource ? ` · ${vexRule.vexSource}` : ""} · to reopen,
            delete this rule
          </span>
          {vexRulesUrl && (
            <Link href={vexRulesUrl} className="text-link hover:opacity-80">
              Manage rules
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VexRuleCard;
