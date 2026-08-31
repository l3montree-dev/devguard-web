// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CustomPagination from "@/components/common/CustomPagination";
import SortingCaret from "@/components/common/SortingCaret";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useTable, { createAppColumnHelper } from "@/hooks/useTable";
import type { TableColumnDef } from "@/hooks/useTable";
import type { Paged } from "@/types/view/pagination";
import type { VexRuleRecommendation } from "@/types/view/vexRules";
import { classNames } from "@/utils/common";
import { flexRender } from "@tanstack/react-table";
import { VerifiedIcon } from "lucide-react";
import type { FunctionComponent } from "react";
import VexRuleResult from "./VexRuleResult";

interface VexRuleRecommendationsTableProps {
  recommendations: Paged<VexRuleRecommendation>;
  isLoading?: boolean;
  hidePagination?: boolean;
  onCreateRule: (recommendation: VexRuleRecommendation) => void;
}

const columnHelper = createAppColumnHelper<VexRuleRecommendation>();

const columnsDef: TableColumnDef<VexRuleRecommendation, any>[] = [
  {
    ...columnHelper.accessor("title", {
      header: "Recommendation",
      id: "title",
      enableSorting: true,
    }),
  },
  {
    ...columnHelper.accessor("eventType", {
      header: "Result",
      id: "event_type",
      enableSorting: true,
    }),
  },
  {
    ...columnHelper.display({
      header: "",
      id: "actions",
      enableSorting: false,
    }),
  },
];

const VexRuleRecommendationsTable: FunctionComponent<
  VexRuleRecommendationsTableProps
> = ({ recommendations, isLoading, onCreateRule, hidePagination }) => {
  const { table } = useTable({
    columnsDef,
    data: recommendations.data,
  });

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-card text-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, i) => (
                    <th
                      key={header.id}
                      className={classNames(
                        "whitespace-nowrap p-4 text-left font-medium",
                        header.column.columnDef.enableSorting &&
                          "cursor-pointer",
                        i === headerGroup.headers.length - 1 && "w-12",
                      )}
                      onClick={
                        header.column.columnDef.enableSorting
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex flex-row items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.columnDef.enableSorting && (
                            <SortingCaret
                              sortDirection={header.column.getIsSorted()}
                            />
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="text-foreground">
              {isLoading
                ? Array.from({ length: 5 }).map((_, row) => (
                    <tr
                      key={row}
                      className={classNames(
                        "border-b last:border-0",
                        row % 2 !== 0 && "bg-card/50",
                      )}
                    >
                      {columnsDef.map((_column, cell) => (
                        <td key={cell} className="p-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : table.getRowModel().rows.map((row, index) => {
                    const recommendation = row.original;
                    return (
                      <tr
                        data-testid="vex-rule-recommendation-row"
                        key={row.id}
                        onClick={() => onCreateRule(recommendation)}
                        className={classNames(
                          "cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50",
                          index % 2 !== 0 && "bg-card/50",
                        )}
                      >
                        <td className="max-w-[420px] p-4">
                          {recommendation.type === "session" && (
                            <span className="block text-xs text-muted-foreground">
                              Created by your organization
                            </span>
                          )}
                          {recommendation.type === "upstream" && (
                            <span className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                              <VerifiedIcon size={14} /> Synced from official
                              sources
                              {recommendation.source && (
                                <span>({recommendation.source})</span>
                              )}
                            </span>
                          )}
                          <span className="block truncate font-medium">
                            {recommendation.title}
                          </span>
                          {recommendation.justification && (
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {recommendation.justification}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <VexRuleResult
                            eventType={recommendation.eventType}
                            mechanicalJustification={
                              recommendation.mechanicalJustification
                            }
                          />
                        </td>
                        <td className="p-4">
                          <Button size="sm" variant="secondary">
                            Create rule
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          {recommendations && !Boolean(hidePagination) && (
            <CustomPagination {...recommendations} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VexRuleRecommendationsTable;
