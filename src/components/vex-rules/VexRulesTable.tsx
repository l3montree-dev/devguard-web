// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { VexRule } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { useState, type FunctionComponent } from "react";
import VexHasEffectBadge from "./VexHasEffectBadge";
import VexRuleActionsCell from "./VexRuleActionsCell";
import VexRuleDetailsDialog from "./VexRuleDetailsDialog";
import VexRuleResult from "./VexRuleResult";
import VexRuleSourceBadge from "./VexRuleSourceBadge";

interface VexRulesTableProps {
  rules: VexRule[];
  // API base of this asset's VEX rules, e.g. /organizations/o/.../vex-rules
  urlBase: string;
  isLoading?: boolean;
  onMutate: () => void;
}

const COLUMNS = ["Rule", "Source", "Result", "Effect", ""];

/**
 * One row per rule — synced and own rules in the same flat list. Clicking a row
 * opens its details; the source is a badge, not a grouping level.
 */
const VexRulesTable: FunctionComponent<VexRulesTableProps> = ({
  rules,
  urlBase,
  isLoading,
  onMutate,
}) => {
  const [selectedRule, setSelectedRule] = useState<VexRule | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-card text-foreground">
              <tr>
                {COLUMNS.map((column, i) => (
                  <th
                    key={column || i}
                    className={classNames(
                      "whitespace-nowrap p-4 text-left font-medium",
                      i === COLUMNS.length - 1 && "w-12",
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-foreground">
              {isLoading
                ? Array.from({ length: 5 }).map((_, row) => (
                    <tr key={row} className="border-b last:border-0">
                      {COLUMNS.map((_column, cell) => (
                        <td key={cell} className="p-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : rules.map((rule) => (
                    <tr
                      data-testid="vex-rule-row"
                      key={rule.id}
                      onClick={() => setSelectedRule(rule)}
                      className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50"
                    >
                      <td className="max-w-[420px] p-4">
                        <span className="block truncate font-medium">
                          {rule.title || rule.cveId || "Untitled rule"}
                        </span>
                        {rule.justification && (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {rule.justification}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <VexRuleSourceBadge vexSource={rule.vexSource} />
                      </td>
                      <td className="p-4">
                        <VexRuleResult
                          eventType={rule.eventType}
                          mechanicalJustification={rule.mechanicalJustification}
                        />
                      </td>
                      <td className="p-4">
                        <VexHasEffectBadge
                          effectCount={rule.appliesToAmountOfDependencyVulns}
                        />
                      </td>
                      {/* The row opens the details dialog, so the menu has to
                          keep its clicks to itself. */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <VexRuleActionsCell
                          rule={rule}
                          deleteUrl={`${urlBase}/${rule.id}`}
                          onDeleted={onMutate}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <VexRuleDetailsDialog
        vexRule={selectedRule}
        isOpen={selectedRule !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRule(null);
        }}
        urlBase={urlBase}
        onDeleted={onMutate}
      />
    </>
  );
};

export default VexRulesTable;
