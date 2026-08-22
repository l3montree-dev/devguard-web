// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AuthGuard from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { classNames } from "@/utils/common";
import { browserApiClient } from "@/services/devGuardApi";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState, type FunctionComponent } from "react";
import type { VexSource } from "@/types/view/vexRules";
import { SOURCE_TYPE_LABEL, useVexSources } from "./useVexSources";

interface VexSourcesSectionProps {
  // Opens the dialog that adds a VEX file or source URL.
  onAddSource: () => void;
}

/** Upstream URLs this repository syncs rules from. */
const VexSourcesSection: FunctionComponent<VexSourcesSectionProps> = ({
  onAddSource,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const { sources, apiUrl, error, isLoading, mutate } = useVexSources();

  // The endpoint takes no source: it re-syncs all of them, hence one button.
  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const response = await browserApiClient(`${apiUrl}/sync/`, {
        method: "POST",
      });
      if (!response.ok) throw new Error(response.statusText);
      toast.success("Syncing all upstream VEX sources");
      mutate();
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
      mutate();
    } catch {
      toast.error("Failed to remove VEX source");
    } finally {
      setDeletingUrl(null);
    }
  };

  if (error) {
    return (
      <p className="text-sm text-destructive">Failed to load VEX sources</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading sources...</p>
      ) : sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No upstream sources configured...
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {sources.map((source, index) => (
            <li
              key={source.url}
              data-testid="vex-source-row"
              className={classNames(
                "flex flex-row items-center justify-between gap-3 p-3",
                index % 2 !== 0 && "bg-card/50",
              )}
            >
              <div className="flex min-w-0 flex-row items-center gap-3">
                <Badge variant="outline" className="shrink-0">
                  {SOURCE_TYPE_LABEL[source.type]}
                </Badge>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {source.url}
                </span>
              </div>
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
            </li>
          ))}
        </ul>
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
          {sources.length > 0 && (
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

export default VexSourcesSection;
