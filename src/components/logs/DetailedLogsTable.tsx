// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CustomPagination from "@/components/common/CustomPagination";
import SortingCaret from "@/components/common/SortingCaret";
import Filter from "@/components/Filter";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import useDebouncedQuerySearch from "@/hooks/useDebouncedQuerySearch";
import useTable, { createAppColumnHelper } from "@/hooks/useTable";
import type { TableColumnDef } from "@/hooks/useTable";
import { toast } from "@/lib/toast";
import type { FilterOption } from "@/types/view/filter";
import type { Paged } from "@/types/view/pagination";
import { LogLevel, type Log } from "@/types/view/logs";
import { classNames } from "@/utils/common";
import { formatDateTime } from "@/utils/format";
import { flexRender } from "@tanstack/react-table";
import { CopyIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";
import LogLevelBadge from "./LogLevelBadge";
import Image from "next/image";

interface DetailedLogsTableProps {
  logs?: Paged<Log>;
  isLoading?: boolean;
}

const NameLink: FunctionComponent<{
  name?: string | null;
  id: string | null;
  kind: "o" | "p" | "a";
}> = ({ name, id, kind }) => {
  if (!name) return <span className="text-muted-foreground/60 ">-</span>;
  if (!id) return <>{name}</>;
  return (
    <Link
      href={`/api/-/${kind}/${id}`}
      className="!text-muted-foreground hover:!text-foreground"
      target="_blank"
    >
      {name}
    </Link>
  );
};

// "Sep 17, 2026, 08:30" - break after the last comma so the clock ends up on
// its own line below the date.
const DateTime: FunctionComponent<{ value: string }> = ({ value }) => {
  const formatted = formatDateTime(value);
  const split = formatted.lastIndexOf(",");
  if (split === -1) return <>{formatted}</>;
  return (
    <>
      {formatted.slice(0, split + 1)}
      <br />
      {formatted.slice(split + 1).trim()}
    </>
  );
};

const IdCell: FunctionComponent<{ value: string | null }> = ({ value }) => {
  if (!value) return <span className="text-muted-foreground/60">-</span>;
  return (
    <span className="flex items-center gap-1">
      <span
        title={value}
        className="max-w-[120px] truncate font-mono text-xs text-muted-foreground"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Copy id"
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success("Copied to clipboard");
        }}
        className="shrink-0 rounded p-1 transition-colors hover:bg-muted"
      >
        <CopyIcon className="h-3.5 w-3.5" />
      </button>
    </span>
  );
};

const NameIdCell: FunctionComponent<{
  name?: string | null;
  id: string | null;
  kind: "o" | "p" | "a";
}> = ({ name, id, kind }) => (
  <span className="flex flex-col gap-0.5">
    <NameLink name={name} id={id} kind={kind} />
    <IdCell value={id} />
  </span>
);

const shortId = (id?: string | null) => (id ? `${id.split("-")[0]}-****` : "-");

const reportIssueUrl = (log: Log) => {
  const base = "https://github.com/l3montree-dev/devguard/issues/new/";

  const title = `[${log.logLevel}] ${log.message.split("\n")[0].slice(0, 120)}`;

  const body = [
    "### What happened?",
    "",
    "<!-- Please add any context that helps us reproduce this. -->",
    "",
    "### Log details",
    "",
    `| Field | Value |`,
    `| --- | --- |`,
    `| Log ID | \`${log.id}\` |`,
    `| Time | ${log.createdAt} |`,
    `| Level | ${log.logLevel} |`,
    `| Organization  | ${log.orgName ?? "-"} (\`${shortId(log.orgID)}\`) |`,
    `| Project | ${log.projectName ?? "-"} (\`${shortId(log.projectID)}\`) |`,
    `| Repository | ${log.assetName ?? "-"} (\`${shortId(log.assetID)}\`) |`,
    "",
    "### Message",
    "",
    "```",
    log.message,
    "```",
  ].join("\n");

  const params = new URLSearchParams({
    title,
    body,
    labels: "bug",
  });

  return `${base}?${params.toString()}`;
};

const ReportCell: FunctionComponent<{ log: Log }> = ({ log }) => (
  <Link
    href={reportIssueUrl(log)}
    target="_blank"
    rel="noreferrer"
    aria-label="Report this log on GitHub"
    title="Report this log on GitHub"
    className={classNames(
      buttonVariants({ variant: "outline", size: "sm" }),
      "whitespace-nowrap",
    )}
  >
    <Image
      alt="GitLab Logo"
      width={15}
      height={15}
      className="dark:invert"
      src={"/assets/github.svg"}
    />
  </Link>
);

const filterOptions: FilterOption[] = [
  {
    label: "Level",
    value: "logs.log_level",
    operators: [{ value: "is" }, { value: "is not" }],
    filterValues: [
      { value: LogLevel.Error, label: "Error" },
      { value: LogLevel.Warn, label: "Warning" },
      { value: LogLevel.Info, label: "Info" },
    ],
  },
  {
    label: "Message",
    value: "logs.message",
    operators: [
      { value: "ilike", label: "contains" },
      { value: "is" },
      { value: "is not" },
    ],
  },
  {
    label: "Project ID",
    value: "p.id",
    operators: [{ value: "is" }],
  },
  {
    label: "Project",
    value: "p.name",
    operators: [
      { value: "ilike", label: "contains" },
      { value: "is" },
      { value: "is not" },
      { value: "is null", label: "is empty" },
    ],
  },
  {
    label: "Repository",
    value: "a.name",
    operators: [
      { value: "ilike", label: "contains" },
      { value: "is" },
      { value: "is not" },
      { value: "is null", label: "is empty" },
    ],
  },
  {
    label: "Repository ID",
    value: "a.id",
    operators: [{ value: "is" }],
  },
];

const columnHelper = createAppColumnHelper<Log>();

const columnsDef: TableColumnDef<Log, any>[] = [
  columnHelper.accessor("createdAt", {
    header: "Time",
    id: "logs.created_at",
    enableSorting: true,
    meta: { className: "whitespace-nowrap text-muted-foreground" },
    cell: (info) => <DateTime value={info.getValue()} />,
  }),
  columnHelper.accessor("logLevel", {
    header: "Level",
    id: "log_level",
    enableSorting: true,
    meta: { className: "whitespace-nowrap" },
    cell: (info) => <LogLevelBadge level={info.getValue()} />,
  }),
  columnHelper.accessor("orgName", {
    header: "Organization",
    id: "org_name",
    enableSorting: true,
    meta: { className: "whitespace-nowrap text-muted-foreground" },
    cell: (info) => (
      <NameIdCell
        name={info.getValue()}
        id={info.row.original.orgID}
        kind="o"
      />
    ),
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    id: "project_name",
    enableSorting: true,
    meta: { className: "whitespace-nowrap text-muted-foreground" },
    cell: (info) => (
      <NameIdCell
        name={info.getValue()}
        id={info.row.original.projectID}
        kind="p"
      />
    ),
  }),
  columnHelper.accessor("assetName", {
    header: "Repository",
    id: "asset_name",
    enableSorting: true,
    meta: { className: "whitespace-nowrap text-muted-foreground" },
    cell: (info) => (
      <NameIdCell
        name={info.getValue()}
        id={info.row.original.assetID}
        kind="a"
      />
    ),
  }),
  columnHelper.accessor("message", {
    header: "Message",
    id: "message",
    enableSorting: false,
    meta: { className: "w-full" },
    cell: (info) => (
      <span className="block max-h-[200px] overflow-y-auto font-mono text-xs whitespace-pre-wrap">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.display({
    header: "Report",
    id: "report",
    meta: { className: "whitespace-nowrap" },
    cell: (info) => <ReportCell log={info.row.original} />,
  }),
];

const DetailedLogsTable: FunctionComponent<DetailedLogsTableProps> = ({
  logs,
  isLoading,
}) => {
  const { table, handleFilter, removeFilter, clearAllFilters } = useTable({
    columnsDef,
    data: logs?.data ?? [],
  });
  const handleSearch = useDebouncedQuerySearch();
  const searchParams = useSearchParams();

  return (
    <div>
      <div className="relative mb-4 flex flex-row items-center gap-2">
        <Filter
          options={filterOptions}
          onFilter={handleFilter}
          onRemoveFilter={removeFilter}
          onClearAllFilters={clearAllFilters}
          search={{
            onChange: handleSearch,
            defaultValue: searchParams?.get("search") ?? "",
            placeholder: "Search message, project, repository...",
          }}
        />
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-card text-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortable = header.column.columnDef.enableSorting;
                    return (
                      <th
                        key={header.id}
                        onClick={
                          sortable
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={classNames(
                          "whitespace-nowrap p-4 text-left font-medium",
                          sortable && "cursor-pointer",
                        )}
                      >
                        <div className="flex flex-row items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          {sortable && (
                            <SortingCaret
                              sortDirection={header.column.getIsSorted()}
                            />
                          )}
                        </div>
                      </th>
                    );
                  })}
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
              ) : !logs || logs.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnsDef.length}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No logs found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <tr
                    data-testid="detailed-log-row"
                    key={row.original.id}
                    className={classNames(
                      "border-b last:border-0",
                      index % 2 !== 0 && "bg-card/50",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={classNames(
                          "p-4",
                          (cell.column.columnDef.meta as any)?.className,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">{logs && <CustomPagination {...logs} />}</div>
      </div>
    </div>
  );
};

export default DetailedLogsTable;
