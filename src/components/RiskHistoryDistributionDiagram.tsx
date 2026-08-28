// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

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
import type { ReleaseRiskHistory } from "@/types/api/api";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { severityToColor } from "./common/Severity";
import { Skeleton } from "./ui/skeleton";

export function RiskHistoryDistributionDiagram({
  data,
  mode = "risk",
  isLoading,
}: {
  data: ReleaseRiskHistory[];
  mode?: "risk" | "cvss";
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {mode === "risk" ? "Risk" : "CVSS"} Distribution Trend
        </CardTitle>
        <CardDescription>
          How the number of vulnerabilities per{" "}
          {mode === "risk" ? "risk" : "CVSS"} severity develops over time.
          {data.length < 3 &&
            " At least 3 days of data are needed for a more meaningful trend."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ChartContainer
              config={{
                cvePurlCritical: {
                  label: "Critical",
                  color: severityToColor("CRITICAL"),
                },
                cvePurlCriticalCvss: {
                  label: "Critical",
                  color: severityToColor("CRITICAL"),
                },
                cvePurlHigh: {
                  label: "High",
                  color: severityToColor("HIGH"),
                },
                cvePurlHighCvss: {
                  label: "High",
                  color: severityToColor("HIGH"),
                },
                cvePurlMedium: {
                  label: "Medium",
                  color: severityToColor("MEDIUM"),
                },
                cvePurlMediumCvss: {
                  label: "Medium",
                  color: severityToColor("MEDIUM"),
                },
                cvePurlLow: {
                  label: "Low",
                  color: severityToColor("LOW"),
                },
                cvePurlLowCvss: {
                  label: "Low",
                  color: severityToColor("LOW"),
                },
              }}
            >
              <AreaChart accessibilityLayer data={data}>
                <ChartLegend content={<ChartLegendContent />} />
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("de-DE", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("de-DE", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  content={({ content, ...props }) => (
                    <ChartTooltipContent
                      {...props}
                      payload={[...(props.payload ?? [])].reverse()}
                      indicator="dot"
                      className="bg-background"
                    />
                  )}
                />
                <defs>
                  {["critical", "high", "medium", "low"].map((level) => {
                    const sev = level.toUpperCase();
                    return (
                      <linearGradient
                        key={level}
                        id={`fill-${level}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={severityToColor(sev)}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor={severityToColor(sev)}
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    );
                  })}
                </defs>
                {[
                  { dataKey: "cvePurlLow", severity: "low" },
                  { dataKey: "cvePurlMedium", severity: "medium" },
                  { dataKey: "cvePurlHigh", severity: "high" },
                  { dataKey: "cvePurlCritical", severity: "critical" },
                ].map(({ dataKey, severity }) => (
                  <Area
                    key={dataKey}
                    dataKey={mode === "risk" ? dataKey : dataKey + "Cvss"}
                    type="monotone"
                    stackId="1"
                    stroke={severityToColor(severity.toUpperCase())}
                    strokeWidth={2}
                    fill={`url(#fill-${severity})`}
                    fillOpacity={0.8}
                    dot={false}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          </ResponsiveContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none"></div>
        <div className="leading-none text-muted-foreground"></div>
      </CardFooter>
    </Card>
  );
}
