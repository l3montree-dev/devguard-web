// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AuthGuard from "@/components/AuthGuard";
import EmptyParty from "@/components/common/EmptyParty";
import SortingCaret from "@/components/common/SortingCaret";
import CustomPagination from "@/components/common/CustomPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { classNames } from "@/utils/common";
import { browserApiClient } from "@/services/devGuardApi";
import type { ExternalReference, Paged } from "@/types/api/api";
import { createColumnHelper, flexRender } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import useTable from "@/hooks/useTable";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState, type FunctionComponent } from "react";

export type VexSourceType = "cyclonedx" | "csaf" | "openvex";
export const isVexSourceType = (type: string): type is VexSourceType =>
  type === "cyclonedx" || type === "csaf" || type === "openvex";

export type VexSource = ExternalReference & { type: VexSourceType };

export const SOURCE_TYPE_LABEL: Record<VexSourceType, string> = {
  cyclonedx: "CycloneDX VEX",
  csaf: "CSAF",
  openvex: "OpenVEX",
};

interface VexSourcesTableProps {
  sources: Paged<VexSource>;
  // API base of this asset's external references, e.g. /organizations/o/.../external-references
  apiUrl: string;
  isLoading?: boolean;
  onMutate: () => void;
  // Opens the dialog that adds a VEX file or source URL.
  onAddSource: () => void;
}

const columnHelper = createColumnHelper<VexSource>();

const columnsDef: ColumnDef<VexSource, any>[] = [
  {
    ...columnHelper.accessor("type", {
      header: "Type",
      id: "type",
      enableSorting: true,
    }),
  },
  {
    ...columnHelper.accessor("url", {
      header: "URL",
      id: "url",
      enableSorting: true,
    }),
  },
  {
    ...columnHelper.accessor("vexRuleCount", {
      header: "VEX rules",
      id: "vex_rule_count",
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

/** Upstream URLs this repository syncs rules from. */
const VexSourcesTable: FunctionComponent<VexSourcesTableProps> = ({
  sources,
  apiUrl,
  isLoading,
  onMutate,
  onAddSource,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const { table } = useTable({
    columnsDef,
    data: sources.data,
  });

  // The endpoint takes no source: it re-syncs all of them, hence one button.
  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const response = await browserApiClient(`${apiUrl}/sync/`, {
        method: "POST",
      });
      if (!response.ok) throw new Error(response.statusText);
      toast.success("Syncing all upstream VEX sources");
      onMutate();
    } catch {
      toast.error("Failed to trigger sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (source: VexSource) => {
    setDeletingUrl(source.url);
    try {
      const response = await browserApiClient(
        `${apiUrl}/${encodeURIComponent(source.url)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(response.statusText);
      toast.success(`Removed ${source.url}`);
      onMutate();
    } catch {
      toast.error("Failed to remove VEX source");
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : sources.data.length === 0 ? (
        <EmptyParty
          title="No upstream sources configured."
          description="Add a VEX file or a URL that carries VEX/CSAF data for the components you use. Syncing a source creates the rules listed in the VEX rules tab."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
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
                {table.getRowModel().rows.map((row, index) => {
                  const source = row.original;
                  return (
                    <tr
                      data-testid="vex-source-row"
                      key={source.url}
                      className={classNames(
                        "border-b transition-colors last:border-0",
                        index % 2 !== 0 && "bg-card/50",
                      )}
                    >
                      <td className="whitespace-nowrap p-4">
                        <Badge variant="outline">
                          {SOURCE_TYPE_LABEL[source.type]}
                        </Badge>
                      </td>
                      <td className="max-w-[420px] p-4">
                        <span className="block truncate font-mono text-xs text-muted-foreground">
                          {source.url}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{source.vexRuleCount}</Badge>
                      </td>
                      <td className="p-4">
                        <AuthGuard require="member">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid="vex-source-remove-button"
                            aria-label={`Remove ${source.url}`}
                            disabled={deletingUrl === source.url}
                            onClick={() => handleDelete(source)}
                          >
                            {deletingUrl === source.url ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </AuthGuard>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4">
              {sources && <CustomPagination {...sources} />}
            </div>
          </div>
        </div>
      )}

      {/* Adding works without sources, syncing does not. */}
      <AuthGuard require="member">
        <div className="flex flex-row justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            data-testid="vex-sources-add-button"
            onClick={onAddSource}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add source
          </Button>
          {sources.data.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              data-testid="vex-sources-sync-all-button"
              disabled={isSyncing}
              onClick={handleSyncAll}
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync all sources
            </Button>
          )}
        </div>
      </AuthGuard>
    </div>
  );
};

export default VexSourcesTable;
