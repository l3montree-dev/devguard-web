// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getSeverityClassNames } from "@/components/common/Severity";
import { classNames } from "@/utils/common";
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowsRightLeftIcon,
  BuildingOffice2Icon,
  FolderOpenIcon,
  LinkIcon,
  TagIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import type {
  InstanceOverview,
  InstanceUsageStatistics,
} from "@/types/api/api";
import { adminBrowserApiClient } from "@/services/adminApi";
import { useInstanceAdmin } from "@/context/InstanceAdminContext";
import MostCommonCVEs from "@/components/organization/MostCommonCVEs";
import MostUsedComponents from "@/components/organization/MostUsedComponents";
import AverageOpenCodeRisks from "@/components/organization/AverageOpenCodeRisks";

export interface InstanceDashboardHandle {
  refresh: () => void;
}

const formatAvg = (n: number | undefined) =>
  (n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

const SEVERITIES = [
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
] as const;

export default forwardRef<InstanceDashboardHandle>(
  function InstanceDashboard(_, ref) {
    const { getPrivateKey } = useInstanceAdmin();
    const [usage, setUsage] = useState<InstanceUsageStatistics | null>(null);
    const [overview, setOverview] = useState<InstanceOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStats = useCallback(async () => {
      const key = getPrivateKey();
      if (!key) return;

      try {
        setLoading(true);
        const [usageResp, vulnResp] = await Promise.all([
          adminBrowserApiClient("/admin/statistics/usage", key),
          adminBrowserApiClient("/admin/statistics/vulnerabilities", key),
        ]);

        if (!usageResp.ok || !vulnResp.ok) {
          setError(
            `Server returned ${!usageResp.ok ? usageResp.status : vulnResp.status}`,
          );
          return;
        }

        setUsage((await usageResp.json()) as InstanceUsageStatistics);
        setOverview((await vulnResp.json()) as InstanceOverview);
        setError(null);
      } catch {
        setError("Failed to fetch instance statistics.");
      } finally {
        setLoading(false);
      }
    }, [getPrivateKey]);

    useImperativeHandle(ref, () => ({ refresh: loadStats }), [loadStats]);

    useEffect(() => {
      loadStats();
    }, [loadStats]);

    if (loading || !usage || !overview) {
      return (
        <div className="flex flex-col gap-4">
          {/* Summary skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-7 w-16" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-3 w-36" />
                </CardFooter>
              </Card>
            ))}
          </div>
          {/* Chart skeleton rows */}
          {Array.from({ length: 3 }).map((_, row) => (
            <div key={row} className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {Array.from({ length: 2 }).map((_, col) => (
                <Card key={col}>
                  <CardHeader>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-1 h-3 w-64" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[250px] w-full rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      );
    }

    const avgByCvss = overview.averageOpenVulnsPerOrg;
    const avgValue: Record<(typeof SEVERITIES)[number]["key"], number> = {
      critical: avgByCvss.cvssAvgCritical,
      high: avgByCvss.cvssAvgHigh,
      medium: avgByCvss.cvssAvgMedium,
      low: avgByCvss.cvssAvgLow,
    };

    const maxProjectTotal = overview.topVulnerableProjects.reduce(
      (max, p) => Math.max(max, p.critical + p.high + p.medium + p.low),
      0,
    );

    console.log("Instance overview:", overview);
    console.log("Instance usage:", usage);

    const summaryCards: {
      icon: typeof UsersIcon;
      label: string;
      value: number;
      hint: string;
    }[] = [
      {
        icon: UsersIcon,
        label: "Users",
        value: usage.NumberOfUsers,
        hint: "Registered users on this instance",
      },
      {
        icon: BuildingOffice2Icon,
        label: "Organisations",
        value: usage.NumberOfOrganizations,
        hint: "Total created organisations",
      },
      {
        icon: FolderOpenIcon,
        label: "Projects",
        value: usage.NumberOfProjects,
        hint: "Projects across all organisations",
      },
      {
        icon: TagIcon,
        label: "Asset Versions",
        value: usage.NumberOfAssetVersions,
        hint: "Total asset versions across projects",
      },
      {
        icon: ArrowsRightLeftIcon,
        label: "Ticket Sync",
        value: usage.NumberOfTicketSyncedProjects,
        hint: "Projects with ticket sync enabled",
      },
      {
        icon: LinkIcon,
        label: "GitLab Integration",
        value: usage.NumberOfProjectsWithGitlabIntegration,
        hint: "Projects with a GitLab integration",
      },
    ];

    return (
      <div className="flex flex-col gap-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map(({ icon: Icon, label, value, hint }) => (
            <Card key={label}>
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {value.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                {hint}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Row 1: Avg open vulns per org (by risk) + Top vulnerable projects */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Avg. Open Vulnerabilities per Organisation
              </CardTitle>
              <CardDescription>
                Mean number of open vulnerabilities per organisation, by CVSS
                severity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SEVERITIES.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex flex-col gap-2 rounded-md border p-3"
                  >
                    <span className="text-2xl font-semibold tabular-nums">
                      {formatAvg(avgValue[key])}
                    </span>
                    <span
                      className={classNames(
                        "w-fit rounded-full px-2 py-1 text-xs font-medium",
                        getSeverityClassNames(label.toUpperCase(), false),
                      )}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Vulnerable Projects</CardTitle>
              <CardDescription>
                Projects with the most open vulnerabilities across the instance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overview.topVulnerableProjects.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No vulnerable projects.
                </p>
              ) : (
                <div className="space-y-3">
                  {overview.topVulnerableProjects.map((p) => {
                    const total = p.critical + p.high + p.medium + p.low;
                    return (
                      <div key={p.slug} className="flex items-end gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="truncate text-sm font-medium">
                            {p.name}
                          </span>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-xs bg-secondary">
                            <div
                              className="h-full rounded-xs bg-primary/70"
                              style={{
                                width: `${maxProjectTotal > 0 ? (total / maxProjectTotal) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium tabular-nums">
                            {total}
                          </span>
                          {p.critical > 0 && (
                            <Badge variant="danger" className="text-xs">
                              {p.critical} critical
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Top CVEs + Top components (reused org components) */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <MostCommonCVEs topCVEs={overview.topCVEs} />
          <MostUsedComponents topComponents={overview.topComponents} />
        </div>

        {/* Row 3: Avg open code risks (reused) + Malicious packages */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AverageOpenCodeRisks amount={overview.averageOpenCodeRisks} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldExclamationIcon className="h-5 w-5 text-red-500" />
                Malicious Packages
              </CardTitle>
              <CardDescription>
                Known malicious packages detected across the instance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <ExclamationTriangleIcon className="h-8 w-8 shrink-0 text-red-500" />
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {overview.maliciousPackages.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    malicious package occurrence
                    {overview.maliciousPackages.length !== 1 ? "s" : ""}{" "}
                    detected across the instance
                  </p>
                </div>
              </div>
              {overview.maliciousPackages.length > 0 && (
                <div className="space-y-3">
                  {overview.maliciousPackages.map((p, i) => (
                    <div
                      key={`${p.maliciousPackageID}-${p.assetSlug}-${i}`}
                      className="flex items-center gap-3 rounded-md border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono text-sm font-medium">
                            {p.component}
                          </span>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {p.maliciousPackageID}
                          </Badge>
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                          {p.orgSlug}/{p.projectSlug}/{p.assetName} (
                          {p.assetVersionName})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
);
