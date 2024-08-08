"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

export function FlawsDistribution({ data }: { data: TransformedAssetRisk[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flaws Distribution</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={ChartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="riskRange"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              //tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="container-scanning"
              fill="hsl(var(--chart-5))"
              radius={4}
            />
            <Bar dataKey="sca" fill="hsl(var(--chart-1))" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none"></div>
        <div className="leading-none text-muted-foreground"></div>
      </CardFooter>
    </Card>
  );
}

/**
export function FlawsDistribution({ data }: { data: TransformedAssetRisk[] }) {
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

  */
