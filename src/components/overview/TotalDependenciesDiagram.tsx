"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

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
import { AssetOverviewDTO } from "@/types/api/api";

export const ColorPalette = [
  "#FFD700", // Gelb
  "#32CD32", // Grün
  "#1E90FF", // Blau
  "#FF69B4", // Pink
  "#FF6347", // Rot
  "#8A2BE2", // Lila
  "#FFA500", // Orange
  "#00CED1", // Türkis
  "#DC143C", // Karmesinrot
];

const ChartConfig = {
  sca: {
    label: "sca",
    color: "#FFD700",
  },
  "container-scanning": {
    label: "container-scanning",
    color: "#32CD32",
  },
};
export { ChartConfig };

export function TotalDependencies({ data }: { data: AssetOverviewDTO }) {
  // Check if data and required keys exist
  if (
    !data ||
    !data.assetCombinedDependencies ||
    !Array.isArray(data.assetCombinedDependencies)
  ) {
    console.error("Invalid data structure:", data);
    return null;
  }

  var i = 0;
  const dataWithColors = data.assetCombinedDependencies.map((item) => ({
    ...item,
    fill: ColorPalette[i++ % ColorPalette.length],
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Dependencies</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 ">
        <ChartContainer
          config={ChartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={dataWithColors}
              dataKey="countDependencies"
              nameKey="scanType"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {data.totalDependenciesNumber}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground "
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
            {dataWithColors.map((item, index) => (
              <ChartLegend
                key={index}
                content={<ChartLegendContent nameKey="scanType" />}
                className="-translate-y-2 flex-wrap gap-2 "
              />
            ))}
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none"></div>
        <div className="leading-none text-muted-foreground"></div>
      </CardFooter>
    </Card>
  );
}
