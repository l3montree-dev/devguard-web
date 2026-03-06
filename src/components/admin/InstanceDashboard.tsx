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
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getSeverityClassNames,
  severityToColor,
} from "@/components/common/Severity";
import { classNames } from "@/utils/common";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
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
import type { InstanceAdminStatsDTO } from "@/types/api/api";

export interface InstanceDashboardHandle {
  refresh: () => void;
}

const mockStats: InstanceAdminStatsDTO = {
  totalUsers: 1024,
  totalOrganisations: 38,
  nonEmptyProjects: 267,
  totalProjectRefs: 1892,
  ticketSyncProjects: 43,
  enabledIntegrations: 17,
  avgVulnsPerOrg: [
    { org: "Acme Corp", critical: 12, high: 34, medium: 67, low: 120 },
    { org: "WidgetCo", critical: 5, high: 18, medium: 42, low: 85 },
    { org: "Foxtail", critical: 8, high: 27, medium: 53, low: 91 },
    { org: "NovaTech", critical: 3, high: 11, medium: 29, low: 60 },
    { org: "Helios", critical: 15, high: 40, medium: 72, low: 130 },
  ],
  topVulnerableAssets: [
    { asset: "api-gateway", org: "Acme Corp", open: 87, critical: 14 },
    { asset: "auth-service", org: "WidgetCo", open: 64, critical: 9 },
    { asset: "frontend-app", org: "Foxtail", open: 52, critical: 6 },
    { asset: "payment-svc", org: "NovaTech", open: 48, critical: 11 },
    { asset: "data-pipeline", org: "Helios", open: 43, critical: 5 },
    { asset: "notification-svc", org: "Acme Corp", open: 39, critical: 3 },
    { asset: "user-mgmt", org: "WidgetCo", open: 31, critical: 2 },
  ],
  topCVEs: [
    { cve: "CVE-2025-31498", affected: 42, severity: "CRITICAL" },
    { cve: "CVE-2025-29927", affected: 38, severity: "CRITICAL" },
    { cve: "CVE-2025-27789", affected: 35, severity: "HIGH" },
    { cve: "CVE-2024-50340", affected: 29, severity: "HIGH" },
    { cve: "CVE-2025-21502", affected: 24, severity: "MEDIUM" },
    { cve: "CVE-2024-47176", affected: 22, severity: "HIGH" },
    { cve: "CVE-2024-38816", affected: 19, severity: "MEDIUM" },
  ],
  topDependencies: [
    { pkg: "lodash", count: 312, ecosystem: "npm" },
    { pkg: "express", count: 287, ecosystem: "npm" },
    { pkg: "golang.org/x/net", count: 245, ecosystem: "go" },
    { pkg: "com.google.guava:guava", count: 198, ecosystem: "maven" },
    { pkg: "axios", count: 176, ecosystem: "npm" },
    { pkg: "org.slf4j:slf4j-api", count: 164, ecosystem: "maven" },
    { pkg: "requests", count: 149, ecosystem: "pypi" },
    { pkg: "react", count: 142, ecosystem: "npm" },
  ],
  avgCodeRisksPerOrg: [
    { org: "Acme Corp", risks: 23 },
    { org: "WidgetCo", risks: 17 },
    { org: "Foxtail", risks: 31 },
    { org: "NovaTech", risks: 9 },
    { org: "Helios", risks: 27 },
  ],
  maliciousPackages: [
    {
      pkg: "event-stream@3.3.6",
      ecosystem: "npm",
      affected: 4,
      type: "Dependency Injection",
    },
    {
      pkg: "ua-parser-js@0.7.29",
      ecosystem: "npm",
      affected: 3,
      type: "Cryptominer",
    },
    {
      pkg: "colors@1.4.1",
      ecosystem: "npm",
      affected: 2,
      type: "Protestware",
    },
  ],
};

export default forwardRef<InstanceDashboardHandle>(
  function InstanceDashboard(_, ref) {
    const [stats, setStats] = useState<InstanceAdminStatsDTO | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
      setLoading(true);
      // TODO: Replace with real API call when endpoint is available
      await new Promise((r) => setTimeout(r, 600));
      setStats(mockStats);
      setLoading(false);
    }, []);

    useImperativeHandle(ref, () => ({ refresh: loadStats }), [loadStats]);

    useEffect(() => {
      loadStats();
    }, [loadStats]);

    if (loading || !stats) {
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

    return (
      <div className="flex flex-col gap-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Users
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stats.totalUsers.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              Registered users on this instance
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <BuildingOffice2Icon className="h-4 w-4" />
                Organisations
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stats.totalOrganisations.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              Total created organisations
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <FolderOpenIcon className="h-4 w-4" />
                Non-Empty Projects
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stats.nonEmptyProjects.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              Projects with at least one asset
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Project Refs
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stats.totalProjectRefs.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              Total asset versions across projects
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <ArrowsRightLeftIcon className="h-4 w-4" />
                Ticket Sync
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stats.ticketSyncProjects.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              Projects with ticket sync enabled
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Integrations
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stats.enabledIntegrations.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              Active PATs for GitLab integration
            </CardFooter>
          </Card>
        </div>

        {/* Row 1: Avg Open Vulns per Org + Top Vulnerable Assets */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Avg. Open Vulnerabilities per Organisation</CardTitle>
              <CardDescription>
                Breakdown by CVSS severity across all organisations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ChartContainer
                  config={{
                    critical: {
                      label: "Critical",
                      color: severityToColor("CRITICAL"),
                    },
                    high: { label: "High", color: severityToColor("HIGH") },
                    medium: {
                      label: "Medium",
                      color: severityToColor("MEDIUM"),
                    },
                    low: { label: "Low", color: severityToColor("LOW") },
                  }}
                >
                  <BarChart
                    data={stats.avgVulnsPerOrg}
                    accessibilityLayer
                    margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="org"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={(props) => {
                        const { content: _, ...rest } = props;
                        return (
                          <ChartTooltipContent
                            {...rest}
                            payload={[...(props.payload ?? [])].reverse()}
                            className="bg-background"
                          />
                        );
                      }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="low"
                      stackId="a"
                      fill={`${severityToColor("LOW")}44`}
                      stroke={severityToColor("LOW")}
                      strokeWidth={1}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="medium"
                      stackId="a"
                      fill={`${severityToColor("MEDIUM")}44`}
                      stroke={severityToColor("MEDIUM")}
                      strokeWidth={1}
                    />
                    <Bar
                      dataKey="high"
                      stackId="a"
                      fill={`${severityToColor("HIGH")}44`}
                      stroke={severityToColor("HIGH")}
                      strokeWidth={1}
                    />
                    <Bar
                      dataKey="critical"
                      stackId="a"
                      fill={`${severityToColor("CRITICAL")}44`}
                      stroke={severityToColor("CRITICAL")}
                      strokeWidth={1}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Vulnerable Projects</CardTitle>
              <CardDescription>
                Assets with the most open vulnerabilities across the instance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topVulnerableAssets.map((a) => (
                  <div key={a.asset} className="flex items-end gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {a.asset}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {a.org}
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-xs bg-secondary">
                        <div
                          className="h-full rounded-xs bg-primary/70"
                          style={{
                            width: `${(a.open / stats.topVulnerableAssets[0].open) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm tabular-nums font-medium">
                        {a.open}
                      </span>
                      {a.critical > 0 && (
                        <Badge variant="danger" className="text-xs">
                          {a.critical} critical
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Top CVEs Across Instance + Top Dependencies */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top CVEs Across Instance</CardTitle>
              <CardDescription>
                Most widespread CVEs by number of affected assets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topCVEs.map((c) => (
                  <div key={c.cve} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-mono">{c.cve}</span>
                    </div>
                    <span
                      className={classNames(
                        "px-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
                        getSeverityClassNames(c.severity, false),
                      )}
                    >
                      {c.severity}
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {c.affected} assets
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Used Dependency Packages</CardTitle>
              <CardDescription>
                Most common dependencies across the entire instance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topDependencies.map((d) => (
                  <div key={d.pkg} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-mono">
                          {d.pkg}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {d.ecosystem}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm tabular-nums font-medium">
                      {d.count}
                    </span>
                    <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">
                      {((d.count / stats.totalProjectRefs) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Avg Code Risks per Org + Malicious Packages */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Avg. Open Code Risks per Organisation</CardTitle>
              <CardDescription>
                Average number of first-party (code) risks across all projects
                per organisation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ChartContainer
                  config={{
                    risks: {
                      label: "Code Risks",
                      color: "hsl(var(--primary))",
                    },
                  }}
                >
                  <BarChart
                    data={stats.avgCodeRisksPerOrg}
                    accessibilityLayer
                    margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="org"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent className="bg-background" />
                      }
                    />
                    <Bar
                      dataKey="risks"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                    {stats.maliciousPackages.reduce(
                      (s, p) => s + p.affected,
                      0,
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    affected assets across {stats.maliciousPackages.length}{" "}
                    malicious packages
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {stats.maliciousPackages.map((p) => (
                  <div
                    key={p.pkg}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-mono font-medium">
                          {p.pkg}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {p.ecosystem}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {p.type}
                      </span>
                    </div>
                    <Badge variant="danger">
                      {p.affected} asset{p.affected !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
);
