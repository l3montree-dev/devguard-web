// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useCallback, useState } from "react";
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

interface Daemon {
  id: string;
  label: string;
  description: string;
  command: string;
}

const daemons: Daemon[] = [
  {
    id: "run-pipeline-single",
    label: "Run Pipeline (Single Asset)",
    description: "Run the asset pipeline for a single asset.",
    command: "devguard-cli daemon runPipeline --asset <asset>",
  },
  {
    id: "run-pipeline-all",
    label: "Run Pipeline (All Assets)",
    description: "Run the asset pipeline for all assets on this instance.",
    command: "devguard-cli daemon runPipeline --all",
  },
  {
    id: "daemon-trigger",
    label: "Trigger Background Jobs",
    description:
      "Trigger all registered background jobs (sync, scheduled scans, etc.).",
    command: "devguard-cli daemon trigger",
  },
  {
    id: "vulndb-sync",
    label: "VulnDB Sync",
    description:
      "Synchronize vulnerability data from upstream sources (NVD, OSV, ExploitDB, and others).",
    command: "devguard-cli vulndb sync",
  },
  {
    id: "vulndb-cleanup",
    label: "VulnDB Cleanup",
    description: "Remove orphaned database tables from failed imports.",
    command: "devguard-cli vulndb cleanup",
  },
];

export default function TriggerDaemonsCard() {
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [assetId, setAssetId] = useState("");

  const handleTriggerDaemon = useCallback(
    (daemon: Daemon) => {
      if (daemon.id === "run-pipeline-single" && !assetId.trim()) {
        toast.error("Please enter an asset ID.");
        return;
      }
      setRunning((prev) => ({ ...prev, [daemon.id]: true }));
      toast.info(`Triggered: ${daemon.label}`);
      // Simulate async operation
      setTimeout(() => {
        setRunning((prev) => ({ ...prev, [daemon.id]: false }));
        toast.success(`${daemon.label} completed.`);
      }, 2500);
    },
    [assetId],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CommandLineIcon className="h-4 w-4" />
          Trigger Daemons
        </CardTitle>
        <CardDescription>
          Manually trigger background daemons and maintenance jobs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {daemons.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{d.label}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {d.description}
                </p>
                <code className="mt-1 block text-xs text-muted-foreground/70">
                  ${" "}
                  {d.id === "run-pipeline-single"
                    ? `devguard-cli daemon runPipeline --asset ${assetId || "<asset-id>"}`
                    : d.command}
                </code>
                {d.id === "run-pipeline-single" && (
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
                  (d.id === "run-pipeline-single" && !assetId.trim())
                }
                onClick={() => handleTriggerDaemon(d)}
              >
                {running[d.id] ? (
                  <>
                    <ArrowPathIcon className="mr-1 h-3.5 w-3.5 animate-spin" />
                    Running…
                  </>
                ) : (
                  <>
                    <PlayIcon className="mr-1 h-3.5 w-3.5" />
                    Trigger
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
