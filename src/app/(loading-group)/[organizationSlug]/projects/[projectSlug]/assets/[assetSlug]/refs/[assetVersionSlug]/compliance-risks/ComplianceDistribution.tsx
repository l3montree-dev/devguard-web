"use client";

import type { FunctionComponent } from "react";
import { Pie, PieChart } from "recharts";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/data-fetcher/fetcher";
import type { ComplianceRiskDTO, Paged } from "@/types/api/api";
import { Loader2 } from "lucide-react";

interface Props {
  uri: string;
  assetVersionSlug: string;
}

const chartConfig: ChartConfig = {
  count: { label: "Risks" },
  open: { label: "Open", color: "hsl(0 84% 60%)" }, // red-500
  resolved: { label: "Resolved", color: "hsl(142 71% 45%)" }, // green-500
};

const ComplianceDistribution: FunctionComponent<Props> = ({
  uri,
  assetVersionSlug,
}) => {
  const base = uri + "refs/" + assetVersionSlug + "/compliance-risks/";

  // TODO(PoC): this chart re-declares the same SWR fetches as ComplianceStats.
  // SWR dedupes by key so it's served from cache rather than re-requested, but the
  // data is still fetched in two places. Optimise by lifting the counts to a shared
  // source (hook/parent) — or a dedicated stats endpoint — so it's fetched once.
  const { data: open, isLoading: openLoading } = useSWR<
    Paged<ComplianceRiskDTO>
  >(base + "?filterQuery[state][is]=open&pageSize=1", fetcher, {
    keepPreviousData: true,
  });
  const { data: resolved, isLoading: resolvedLoading } = useSWR<
    Paged<ComplianceRiskDTO>
  >(base + "?filterQuery[state][is not]=open&pageSize=1", fetcher, {
    keepPreviousData: true,
  });

  const isLoading = openLoading || resolvedLoading;
  const openCount = open?.total ?? 0;
  const resolvedCount = resolved?.total ?? 0;
  const total = openCount + resolvedCount;

  const chartData = [
    { state: "open", count: openCount, fill: "var(--color-open)" },
    { state: "resolved", count: resolvedCount, fill: "var(--color-resolved)" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pr-5">
      <Card className="bg-background">
        <CardHeader className="items-start pb-4">
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Distribution of {total} compliance risks by state
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          {isLoading ? (
            <div className="flex h-[220px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : total > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[220px]"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="state" />}
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="state"
                  innerRadius={55}
                  strokeWidth={2}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="state" />}
                  className="-translate-y-2 flex-wrap gap-2 *:justify-center"
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-muted-foreground">
              No compliance risks to chart yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Quick overview of your compliance risk status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Total risks
                </span>
                <Badge variant="outline">{total}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Open</span>
                <Badge variant="outline" className="text-red-500">
                  {openCount}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Resolved</span>
                <Badge variant="outline" className="text-green-500">
                  {resolvedCount}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceDistribution;
