// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useCsafAccess } from "@/components/advisory/CsafAccessNotice";
import CustomPagination from "@/components/common/CustomPagination";
import EmptyParty from "@/components/common/EmptyParty";
import SortingCaret from "@/components/common/SortingCaret";
import { CVSSBadge } from "@/components/common/Severity";
import FormatDate from "@/components/risk-assessment/FormatDate";
import useTable from "@/hooks/useTable";
import type { Paged, SecurityAdvisory } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { vectorStringToScore } from "@/utils/cvss";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { FunctionComponent } from "react";
import { useMemo } from "react";

const columnHelper = createColumnHelper<SecurityAdvisory>();

// updatedAt means something different per tab, so the header is named after the
// state whose advisories are currently listed.
const updatedAtHeader: Record<string, string> = {
  draft: "Opened",
  public: "Published",
  withdrawn: "Withdrawn",
};

const buildColumnsDef = (
  state: string,
  csafBaseUrl: string,
  sharesInformation: boolean,
): ColumnDef<SecurityAdvisory, any>[] => [
  columnHelper.accessor("title", {
    header: "Title",
    enableSorting: true,
    cell: (info) => {
      return (
        info.getValue() && (
          <div className="w-full text-base text-foreground">
            {info.getValue()}
          </div>
        )
      );
    },
  }),

  columnHelper.accessor("severity", {
    header: "Severity",
    enableSorting: true,
    meta: { className: "w-40 whitespace-nowrap" },
    cell: (info) => {
      const severity = info.getValue();
      if (!severity) return null;
      const score = vectorStringToScore(info.row.original.vectorString ?? "");
      if (score === null) return null;
      return <CVSSBadge cvss={score} />;
    },
  }),

  columnHelper.accessor("updatedAt", {
    header: updatedAtHeader[state] ?? "Updated",
    enableSorting: true,
    meta: { className: "w-40 whitespace-nowrap" },
    cell: (info) => {
      const value = info.getValue();
      return value && <FormatDate dateString={value} />;
    },
  }),

  // CSAF documents are only served while the repository shares information, so
  // the column is dropped rather than linking into a 404.
  ...(sharesInformation
    ? [
        columnHelper.display({
          id: "csaf",
          header: "CSAF",
          meta: { className: "w-24 whitespace-nowrap" },
          cell: (info) => {
            const advisory = info.row.original;
            if (advisory.state !== "public") return null;
            const year = new Date(advisory.createdAt).getFullYear();
            const href = `${csafBaseUrl}/csaf/white/${year}/dgsa-${advisory.id}.json`;
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-link"
                onClick={(e) => e.stopPropagation()}
              >
                View
              </a>
            );
          },
        }),
      ]
    : []),
];

interface AdvisoryTableProps {
  advisories?: Paged<SecurityAdvisory>;
  /** Advisory state being listed - drives the updatedAt header. */
  state: string;
  /** Asset-scoped API base the per-row CSAF document links are built from. */
  csafBaseUrl: string;
  onRowClick: (advisory: SecurityAdvisory) => void;
}

const AdvisoryTable: FunctionComponent<AdvisoryTableProps> = ({
  advisories,
  state,
  csafBaseUrl,
  onRowClick,
}) => {
  const { sharesInformation } = useCsafAccess();
  const columnsDef = useMemo(
    () => buildColumnsDef(state, csafBaseUrl, sharesInformation),
    [state, csafBaseUrl, sharesInformation],
  );
  const { table } = useTable(
    { columnsDef, data: advisories?.data ?? [] },
    { getSortedRowModel: getSortedRowModel(), manualSorting: false },
  );

  if (!advisories?.data?.length) {
    return (
      <EmptyParty
        title="No matching results."
        description="Security advisories are intended to enable you to create and publish your own vulnerability reports. This process is done by identifying, creating, and publishing advisories."
      />
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border shadow-sm">
        <div className="overflow-auto">
          <table className="w-full overflow-x-auto text-sm">
            <thead className="border-b bg-card text-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className={classNames(
                        "cursor-pointer whitespace-nowrap break-normal p-4 text-left",
                        (header.column.columnDef.meta as any)?.className,
                      )}
                      onClick={
                        header.column.columnDef.enableSorting
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      key={header.id}
                    >
                      <div className="flex flex-row items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        <SortingCaret
                          sortDirection={header.column.getIsSorted()}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="text-sm text-foreground">
              {table.getRowModel().rows.map((row, i, arr) => (
                <tr
                  onClick={() => onRowClick(row.original)}
                  className={classNames(
                    "relative cursor-pointer align-top transition-all",
                    i === arr.length - 1 ? "" : "border-b",
                    i % 2 != 0 && "bg-card/50",
                    "hover:bg-muted",
                  )}
                  key={row.original.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className={classNames(
                        "p-4",
                        (cell.column.columnDef.meta as any)?.className,
                      )}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <CustomPagination {...advisories} />
      </div>
    </div>
  );
};

export default AdvisoryTable;
