// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CustomPagination from "@/components/common/CustomPagination";
import { Skeleton } from "@/components/ui/skeleton";
import useTable, { createAppColumnHelper } from "@/hooks/useTable";
import type { TableColumnDef } from "@/hooks/useTable";
import type { Paged } from "@/types/view/pagination";
import type { Log } from "@/types/view/logs";
import { classNames } from "@/utils/common";
import { formatDateTime } from "@/utils/format";
import { flexRender } from "@tanstack/react-table";
import type { FunctionComponent } from "react";

interface LogsTableProps {
  logs?: Paged<Log>;
  isLoading?: boolean;
}

const columnHelper = createAppColumnHelper<Log>();

const permalinkHref = (log: Log) => {
  if (log.assetID) return `/api/-/a/${log.assetID}`;
  if (log.projectID) return `/api/-/p/${log.projectID}`;
  return `/api/-/o/${log.orgID}`;
};

// "project / asset" - shows where the log happened, narrowing from left to
// right. Falls back to the organization when neither is set.
const logSource = (log: Log) =>
  [log.projectName, log.assetName].filter(Boolean).join(" / ");

const columnsDef: TableColumnDef<Log, any>[] = [
  {
    ...columnHelper.accessor("createdAt", {
      header: "Time",
      id: "created_at",
      enableSorting: true,
    }),
  },
  {
    ...columnHelper.accessor("projectName", {
      header: "Source",
      id: "project_name",
      enableSorting: false,
    }),
  },
  {
    ...columnHelper.accessor("message", {
      header: "Message",
      id: "message",
      enableSorting: false,
    }),
  },
];

const LogsTable: FunctionComponent<LogsTableProps> = ({ logs, isLoading }) => {
  const { table } = useTable({
    columnsDef,
    data: logs?.data ?? [],
  });

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-card text-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap p-4 text-left font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="text-foreground">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, row) => (
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
              ) : !logs || logs?.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnsDef.length}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No logs found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, index) => {
                  const log = row.original;
                  const href = permalinkHref(log);
                  return (
                    <tr
                      data-testid="log-row"
                      key={log.id}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("a")) return;
                        window.location.href = href;
                      }}
                      className={classNames(
                        "cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50",
                        index % 2 !== 0 && "bg-card/50",
                      )}
                    >
                      <td className="whitespace-nowrap p-4 text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="whitespace-nowrap p-4 text-muted-foreground">
                        {logSource(log) || (
                          <span className="text-muted-foreground/60">-</span>
                        )}
                      </td>
                      <td className="max-w-[560px] p-4">
                        <a
                          href={href}
                          className="block whitespace-pre-wrap break-words font-mono text-xs"
                        >
                          {log.message}
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">{logs && <CustomPagination {...logs} />}</div>
      </div>
    </div>
  );
};

export default LogsTable;
