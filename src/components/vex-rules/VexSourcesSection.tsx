// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AuthGuard from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetcher } from "@/data-fetcher/fetcher";
import useDecodedParams from "@/hooks/useDecodedParams";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type { ExternalReference } from "@/types/api/api";
import { Loader2, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState, type FunctionComponent } from "react";
import useSWR from "swr";

type VexSourceType = "cyclonedx" | "csaf";

const SOURCE_TYPE_LABEL: Record<VexSourceType, string> = {
  cyclonedx: "CycloneDX VEX",
  csaf: "CSAF",
};

const PLACEHOLDER: Record<VexSourceType, string> = {
  cyclonedx: "https://supplier.example.com/vex.json",
  csaf: "https://supplier.example.com/csaf/provider-metadata.json",
};

const isVexSourceType = (type: string): type is VexSourceType =>
  type === "cyclonedx" || type === "csaf";

/**
 * Upstream VEX/CSAF URLs this repository syncs rules from. Each one can be
 * re-synced or removed; the rules they produce live in the table above.
 */
const VexSourcesSection: FunctionComponent = () => {
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };
  const [activeTab, setActiveTab] = useState<VexSourceType>("cyclonedx");
  const [url, setUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [syncingUrl, setSyncingUrl] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const apiUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/external-references`;
  const {
    data: allRefs,
    error,
    mutate,
    isLoading,
  } = useSWR<ExternalReference[]>(apiUrl, fetcher);

  const sources = (allRefs ?? []).filter((ref) => isVexSourceType(ref.type));

  const handleSync = async (source: ExternalReference) => {
    setSyncingUrl(source.url);
    try {
      const response = await browserApiClient(`${apiUrl}/sync/`, {
        method: "POST",
      });
      if (!response.ok) throw new Error(response.statusText);
      // The endpoint re-syncs every configured source at once.
      toast.success("Syncing upstream VEX sources");
      mutate();
    } catch {
      toast.error("Failed to trigger sync");
    } finally {
      setSyncingUrl(null);
    }
  };

  const handleDelete = async (source: ExternalReference) => {
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

  const handleAdd = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsAdding(true);
    try {
      const response = await browserApiClient(`${apiUrl}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), type: activeTab }),
      });
      if (!response.ok) throw new Error(response.statusText);

      toast.success(`${SOURCE_TYPE_LABEL[activeTab]} source added`);
      setUrl("");
      mutate();
    } catch {
      toast.error(`Failed to add ${SOURCE_TYPE_LABEL[activeTab]} source`);
    } finally {
      setIsAdding(false);
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
          {sources.map((source) => (
            <li
              key={source.id}
              className="flex flex-row items-center justify-between gap-3 p-3"
            >
              <div className="flex min-w-0 flex-row items-center gap-3">
                <Badge variant="outline" className="shrink-0">
                  {SOURCE_TYPE_LABEL[source.type as VexSourceType]}
                </Badge>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {source.url}
                </span>
              </div>
              <AuthGuard require="member">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={
                        syncingUrl === source.url || deletingUrl === source.url
                      }
                    >
                      {syncingUrl === source.url ||
                      deletingUrl === source.url ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSync(source)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync now
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(source)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove URL
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </AuthGuard>
            </li>
          ))}
        </ul>
      )}

      <AuthGuard require="member">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (isVexSourceType(value)) setActiveTab(value);
          }}
        >
          <TabsList>
            <TabsTrigger value="cyclonedx">VEX</TabsTrigger>
            <TabsTrigger value="csaf">CSAF</TabsTrigger>
          </TabsList>
          {(["cyclonedx", "csaf"] as VexSourceType[]).map((type) => (
            <TabsContent key={type} value={type}>
              <div className="flex flex-row gap-2">
                <Input
                  placeholder={PLACEHOLDER[type]}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="flex-1"
                />
                <Button onClick={handleAdd} disabled={isAdding}>
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </AuthGuard>
    </div>
  );
};

export default VexSourcesSection;
