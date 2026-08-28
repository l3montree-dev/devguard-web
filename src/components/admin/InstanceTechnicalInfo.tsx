// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowTopRightOnSquareIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  CodeBracketIcon,
} from "@heroicons/react/20/solid";
import { useAdminQuery } from "@/hooks/useAdminQuery";
import { checkForUpdate } from "@/services/versionCheck";
import { formatBytes, formatDateTime, formatDuration } from "@/utils/format";
import type {
  InstanceTechnicalInfoHandle,
  VersionCheckResult,
} from "@/types/view/admin";

function Row({
  label,
  value,
  mono,
  href,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  href?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 truncate text-sm font-medium text-primary underline underline-offset-2"
        >
          <span className={mono ? "font-mono" : ""}>{value}</span>
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0" />
        </a>
      ) : (
        <span
          className={`truncate text-sm font-medium ${mono ? "font-mono" : ""}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export default forwardRef<InstanceTechnicalInfoHandle>(
  function InstanceTechnicalInfo(_, ref) {
    const {
      data: info,
      isLoading: loading,
      error: fetchError,
      mutate: refresh,
    } = useAdminQuery("/info");

    const [versionCheck, setVersionCheck] = useState<VersionCheckResult | null>(
      null,
    );

    const version = info?.build?.version;

    useEffect(() => {
      if (!version) return;
      let ignore = false;
      checkForUpdate(version).then((result) => {
        if (!ignore) setVersionCheck(result);
      });
      return () => {
        ignore = true;
      };
    }, [version]);

    useImperativeHandle(ref, () => ({ refresh }), [refresh]);

    const error = fetchError ? "Failed to fetch instance info." : null;

    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {[4, 3, 5, 4].map((rows, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1 h-3 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: rows }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error || !info) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-destructive">
              {error ?? "No instance info available."}
            </p>
          </CardContent>
        </Card>
      );
    }

    const commitShort = info.build.commit.slice(0, 8);
    const commitUrl = `https://github.com/l3montree-dev/devguard/commit/${info.build.commit}`;
    const vulndbUrl =
      "https://github.com/l3montree-dev/devguard/pkgs/container/devguard%2Fvulndb%2Fv2";

    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Build */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CodeBracketIcon className="h-4 w-4" />
              Build
            </CardTitle>
            <CardDescription>
              Version and source control information.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <Row
              label="Version"
              value={
                <span className="flex items-center gap-2">
                  {info.build.version}
                  {versionCheck?.updateAvailable && (
                    <a
                      href={versionCheck.latestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge variant="success" className="cursor-pointer">
                        {versionCheck.latestVersion} available
                      </Badge>
                    </a>
                  )}
                  {versionCheck && !versionCheck.updateAvailable && (
                    <Badge variant="secondary">up to date</Badge>
                  )}
                </span>
              }
              mono
            />
            <Row label="Commit" value={commitShort} mono href={commitUrl} />
            <Row label="Branch" value={info.build.branch} mono />
            <Row
              label="Build Date"
              value={new Date(info.build.buildDate).toLocaleString()}
            />
          </CardContent>
        </Card>

        {/* Process */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ServerIcon className="h-4 w-4" />
              Process
            </CardTitle>
            <CardDescription>
              Server process and uptime details.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <Row label="PID" value={info.process.pid} mono />
            <Row label="Hostname" value={info.process.hostname} mono />
            <Row
              label="Uptime"
              value={formatDuration(info.process.uptimeSeconds)}
            />
          </CardContent>
        </Card>

        {/* Runtime */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CpuChipIcon className="h-4 w-4" />
              Runtime
            </CardTitle>
            <CardDescription>Go runtime and memory statistics.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <Row label="Go Version" value={info.runtime.goVersion} mono />
            <Row label="Goroutines" value={info.runtime.numGoroutines} />
            <Row
              label="Heap Alloc"
              value={formatBytes(info.runtime.mem.heapAlloc)}
            />
            <Row label="Sys Memory" value={formatBytes(info.runtime.mem.sys)} />
            <Row
              label="Total Alloc"
              value={formatBytes(info.runtime.mem.totalAlloc)}
            />
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleStackIcon className="h-4 w-4" />
              Database
            </CardTitle>
            <CardDescription>
              Connection pool and migration status.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <Row
              label="Status"
              value={
                <Badge
                  variant={
                    info.database.status === "healthy" ? "success" : "danger"
                  }
                >
                  {info.database.status}
                </Badge>
              }
            />
            <Row
              label="Connections"
              value={`${info.database.openConnections} / ${info.database.maxOpenConnections} (${info.database.inUse} in use, ${info.database.idle} idle)`}
            />
            <Row
              label="Migration"
              value={
                <span className="flex items-center gap-2">
                  v{info.database.migrationVersion}
                  {info.database.migrationDirty && (
                    <Badge variant="danger">dirty</Badge>
                  )}
                </span>
              }
            />
            <Row
              label="VulnDB Version"
              value={formatDateTime(info.database.vulndbVersion)}
              href={vulndbUrl}
            />
          </CardContent>
        </Card>
      </div>
    );
  },
);
