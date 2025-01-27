"use client";

import { Label, Pie, PieChart } from "recharts";

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
} from "@/components/ui/chart";
import { DependencyCountByscanner } from "@/types/api/api";

export function DependenciesPieChart({
  data,
}: {
  data: DependencyCountByscanner;
}) {
  const chartConfig = Object.keys(data).reduce((acc, key, i) => {
    return {
      ...acc,
      [key]: {
        label: key,
        color: "hsl(var(--chart-" + (i + 1) + "))",
      },
    };
  }, {} as any);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Dependencies</CardTitle>
        <CardDescription>
          The total number of dependencies found by the different scanners
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 ">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={Object.entries(data).map(([scanner, count]) => ({
                scanner,
                count,
                fill: chartConfig[scanner].color,
              }))}
              dataKey="count"
              nameKey="scanner"
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
                          {Object.values(data).reduce(
                            (acc, count) => acc + count,
                            0,
                          )}
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
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
