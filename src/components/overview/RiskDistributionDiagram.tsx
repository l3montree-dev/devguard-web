"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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
import { TransformedAssetRisk } from "@/types/api/api";
import { ChartConfig } from "./TotalDependenciesDiagram";

export function RiskDistribution({ data }: { data: TransformedAssetRisk[] }) {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Flaws Distribution</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={ChartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart
            data={data}
            margin={{
              top: -40,
              bottom: -10,
            }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey="riskRange" />
            <PolarGrid />
            <Radar
              dataKey="container-scanning"
              fill="var(--color-container-scanning)  "
            />
            <Radar dataKey="sca" fill="var(--color-sca)" />

            <ChartLegend className="mt-8" content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none"></div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground"></div>
      </CardFooter>
    </Card>
  );
}
