// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowPathIcon, PlayIcon } from "@heroicons/react/20/solid";
import { CommandLineIcon } from "@heroicons/react/24/outline";
import { useInstanceAdmin } from "@/context/InstanceAdminContext";
import {
  adminSSETrigger,
  AdminAPIError,
  type DaemonSSEEvent,
} from "@/services/adminApi";

interface Daemon {
  id: string;
  label: string;
  description: string;
  /** Admin API endpoint path (relative to /api/v1) */
  endpoint: string;
  /** Whether a body payload with assetId is needed */
  requiresAssetId?: boolean;
}

const daemons: Daemon[] = [
  {
    id: "openSourceInsights",
    label: "Open Source Insights",
    description: "Sync open-source project metadata from deps.dev.",
    endpoint: "/admin/daemons/open-source-insights/trigger",
  },
  {
    id: "vulndb",
    label: "VulnDB Import",
    description: "Run an incremental VulnDB import from upstream diffs.",
    endpoint: "/admin/daemons/vulndb/trigger",
  },
  {
    id: "vulndbCleanup",
    label: "VulnDB Cleanup",
    description: "Remove orphaned database tables from failed imports.",
    endpoint: "/admin/daemons/vulndb-cleanup/trigger",
  },
  {
    id: "fixedVersions",
    label: "Fixed Versions",
    description: "Update known fixed versions for tracked vulnerabilities.",
    endpoint: "/admin/daemons/fixed-versions/trigger",
  },
  {
    id: "assetPipelineAll",
    label: "Asset Pipeline (All)",
    description: "Run the asset pipeline for every asset on this instance.",
    endpoint: "/admin/daemons/asset-pipeline-all/trigger",
  },
  {
    id: "assetPipelineSingle",
    label: "Asset Pipeline (Single)",
    description: "Run the asset pipeline for a single asset by ID.",
    endpoint: "/admin/daemons/asset-pipeline-single/trigger",
    requiresAssetId: true,
  },
];

export default function TriggerDaemonsCard() {
  const { getPrivateKey } = useInstanceAdmin();
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [assetId, setAssetId] = useState("");
  const logContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const appendLog = useCallback((daemonId: string, message: string) => {
    setLogs((prev) => ({
      ...prev,
      [daemonId]: [...(prev[daemonId] ?? []), message],
    }));
    // Auto-scroll the log container to the bottom without moving the page
    setTimeout(() => {
      const el = logContainerRefs.current[daemonId];
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }, []);

  const handleTriggerDaemon = useCallback(
    async (daemon: Daemon) => {
      if (daemon.requiresAssetId && !assetId.trim()) {
        toast.error("Please enter an asset ID.");
        return;
      }

      const privateKey = getPrivateKey();
      if (!privateKey) {
        toast.error("Admin session expired. Please re-authenticate.");
        return;
      }

      // Clear previous logs and set running
      setLogs((prev) => ({ ...prev, [daemon.id]: [] }));
      setRunning((prev) => ({ ...prev, [daemon.id]: true }));

      try {
        const body = daemon.requiresAssetId
          ? JSON.stringify({ assetId: assetId.trim() })
          : undefined;

        await adminSSETrigger(
          daemon.endpoint,
          privateKey,
          (evt: DaemonSSEEvent) => {
            switch (evt.event) {
              case "log":
                appendLog(daemon.id, evt.data);
                break;
              case "done":
                appendLog(daemon.id, "Completed successfully.");
                toast.success(`${daemon.label} completed.`);
                break;
              case "error":
                try {
                  const parsed = JSON.parse(evt.data);
                  appendLog(daemon.id, `Error: ${parsed.message}`);
                  toast.error(`${daemon.label} failed: ${parsed.message}`);
                } catch {
                  appendLog(daemon.id, `Error: ${evt.data}`);
                  toast.error(`${daemon.label} failed.`);
                }
                break;
            }
          },
          body,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown error";
        appendLog(daemon.id, `Error: ${message}`);
        if (err instanceof AdminAPIError && err.status === 429) {
          toast.warning(`${daemon.label}: ${message}`);
        } else {
          toast.error(`${daemon.label}: ${message}`);
        }
      } finally {
        setRunning((prev) => ({ ...prev, [daemon.id]: false }));
      }
    },
    [assetId, getPrivateKey, appendLog],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CommandLineIcon className="h-4 w-4" />
          Trigger Daemons
        </CardTitle>
        <CardDescription>
          Manually trigger individual background daemons. Each daemon has a
          5-minute cooldown between triggers (shared across all API instances).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {daemons.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-2 rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{d.label}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.description}
                  </p>
                  {d.requiresAssetId && (
                    <Input
                      className="mt-2 h-7 w-64 text-xs"
                      placeholder="Enter asset ID…"
                      value={assetId}
                      variant="onCard"
                      onChange={(e) => setAssetId(e.target.value)}
                    />
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  disabled={
                    running[d.id] ||
                    (d.requiresAssetId === true && !assetId.trim())
                  }
                  onClick={() => handleTriggerDaemon(d)}
                >
                  {running[d.id] ? (
                    <>
                      <ArrowPathIcon className="mr-1 h-3 w-3 animate-spin" />
                      Running…
                    </>
                  ) : (
                    <>
                      <PlayIcon className="mr-1 h-3 w-3" />
                      Trigger
                    </>
                  )}
                </Button>
              </div>
              {/* SSE log output */}
              {logs[d.id] && logs[d.id].length > 0 && (
                <div
                  ref={(el) => {
                    logContainerRefs.current[d.id] = el;
                  }}
                  className="max-h-32 overflow-y-auto rounded bg-muted/50 px-2 py-1.5 font-mono text-xs text-muted-foreground"
                >
                  {logs[d.id].map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
