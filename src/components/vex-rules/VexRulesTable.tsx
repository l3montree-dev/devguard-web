// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import SortingCaret from "@/components/common/SortingCaret";
import useTable from "@/hooks/useTable";
import type { Paged, VexRule } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { createColumnHelper, flexRender } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useState, type FunctionComponent } from "react";
import VexRuleActionsCell from "./VexRuleActionsCell";
import VexRuleDetailsDialog from "./VexRuleDetailsDialog";
import VexRuleResult from "./VexRuleResult";
import VexRuleSourceBadge from "./VexRuleSourceBadge";
import CustomPagination from "../common/CustomPagination";

interface VexRulesTableProps {
  rules: Paged<VexRule>;
  // API base of this asset's VEX rules, e.g. /organizations/o/.../vex-rules
  urlBase: string;
  isLoading?: boolean;
  onMutate: () => void;
}

const columnHelper = createColumnHelper<VexRule>();

const columnsDef: ColumnDef<VexRule, any>[] = [
  {
    ...columnHelper.accessor("title", {
      header: "Rule",
      id: "title",
      enableSorting: true,
    }),
  },
  {
    ...columnHelper.accessor("vexSource", {
      header: "Source",
      id: "vex_source",
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

/** One flat row per rule; the source is a badge, not a grouping level. */
const VexRulesTable: FunctionComponent<VexRulesTableProps> = ({
  rules,
  urlBase,
  isLoading,
  onMutate,
}) => {
  const [selectedRule, setSelectedRule] = useState<VexRule | null>(null);

  const { table } = useTable({
    columnsDef,
    data: rules.data,
  });

  return (
    <>
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
                      const rule = row.original;
                      return (
                        <tr
                          data-testid="vex-rule-row"
                          key={rule.id}
                          onClick={() => setSelectedRule(rule)}
                          className={classNames(
                            "cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50",
                            index % 2 !== 0 && "bg-card/50",
                          )}
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
                              mechanicalJustification={
                                rule.mechanicalJustification
                              }
                            />
                          </td>
                          {/* The row itself opens the dialog, so the menu keeps its
                            clicks to itself. */}
                          <td
                            className="p-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <VexRuleActionsCell
                              deleteUrl={`${urlBase}/${rule.id}`}
                              onEdit={() => setSelectedRule(rule)}
                              onDeleted={onMutate}
                            />
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          <div className="mt-4">{rules && <CustomPagination {...rules} />}</div>
        </div>
      </div>

      <VexRuleDetailsDialog
        vexRule={selectedRule}
        isOpen={selectedRule !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRule(null);
        }}
        urlBase={urlBase}
        onChanged={onMutate}
      />
    </>
  );
};

export default VexRulesTable;
