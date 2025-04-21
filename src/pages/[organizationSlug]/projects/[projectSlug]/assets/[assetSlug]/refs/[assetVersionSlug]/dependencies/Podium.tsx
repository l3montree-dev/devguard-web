"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
const chartData = [
  {
    month: "here is a long ass critria name that i-",
    desktop: 1,
  },
  { month: "1st", desktop: 3 },
  { month: "2nd", desktop: 2 },
];

const chartConfig = {
  desktop: {
    label: "fuck",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function Podium() {
  return (
    <div>
      <CardHeader>
        <CardTitle>Worst Categories</CardTitle>
        <CardDescription>This sucks.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 30,
            }}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />

            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          3 Worst categories
        </div>
      </CardFooter>
    </div>
  );
}
