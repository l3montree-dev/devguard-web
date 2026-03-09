"use client";

import { Pie, PieChart } from "recharts";

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
  type ChartConfig,
} from "@/components/ui/chart";
import { FunctionComponent, useMemo } from "react";
import { EcosystemUsageInOrg } from "@/types/api/api";

interface Props {
  ecosystems: EcosystemUsageInOrg[];
}

const chartColors = ["red", "blue", "green", "yellow", "purple"];

const MostUsedEcosystems: FunctionComponent<Props> = ({ ecosystems }) => {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      amount: { label: "Details" },
    };
    ecosystems.forEach((eco, i) => {
      config[eco.ecosystem] = {
        label: eco.ecosystem,
        color: chartColors[i],
      };
    });
    return config;
  }, [ecosystems]);

  const chartData = ecosystems.map((eco) => ({
    ecosystem: eco.ecosystem,
    amount: eco.relativeAmount,
    totalCount: eco.totalCount,
    fill: `var(--color-${eco.ecosystem})`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Ecosystems</CardTitle>
        <CardDescription>
          Most used ecosystems across Organization
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="font-medium">{entry.ecosystem}</span>
                    </div>
                    <div className="text-muted-foreground mt-1.5 grid gap-0.5 pl-[18px]">
                      <span>Total: {entry.totalCount}</span>
                      <span>Share: {(entry.amount * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              startAngle={90}
              endAngle={-270}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="ecosystem" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MostUsedEcosystems;
