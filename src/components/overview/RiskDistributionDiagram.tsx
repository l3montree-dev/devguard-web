"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { RiskDistribution } from "@/types/api/api";
import { beautifyScannerId } from "@/utils/common";
import { uniq } from "lodash";

//  { range: "0-2", scanner1: 186, scanner2: 80 },
const combineRanges = (data: RiskDistribution[]) => {
  const uniqueRanges = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const scanner = uniq(data.map((item) => item.scannerId));
  return uniqueRanges.map((range) => {
    const rangeData = data.filter((item) => item.severity === range);
    const rangeDataScanner = scanner.map((scannerId) => {
      const scannerData = rangeData.find(
        (item) => item.scannerId === scannerId,
      );
      return {
        scannerId,
        count: scannerData ? scannerData.count : 0,
      };
    });

    return rangeDataScanner.reduce((acc, item) => {
      return {
        ...acc,
        range,
        [item.scannerId]: item.count,
      };
    }, {});
  });
};

export function RiskDistributionDiagram({
  data,
}: {
  data: RiskDistribution[];
}) {
  const chartConfig = uniq(data.map((item) => item.scannerId)).reduce(
    (acc, scannerId, i) => ({
      ...acc,
      [scannerId]: {
        label: beautifyScannerId(scannerId),
        color: `hsl(var(--chart-${i + 1}))`,
      },
    }),
    {} as any,
  );

  const chartData = combineRanges(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Flaws</CardTitle>
        <CardDescription>
          Showing the distribution of flaws based on the risk range and the scan
          type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              //tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent className="bg-background" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(chartConfig).map((scannerId, i, arr) => (
              <Bar
                key={scannerId}
                dataKey={scannerId}
                radius={4}
                fill={chartConfig[scannerId].color}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
