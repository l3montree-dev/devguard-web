// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import React, { FunctionComponent } from "react";
import SkeletonListItem from "./SkeletonListItem";
import { Button } from "../ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Label, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CartesianGrid, XAxis, Bar, BarChart } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { TrendingUp } from "lucide-react";

interface Props {
  title: string;
  description: string;
  onClick: () => void;
  buttonTitle: string;
}

const chartData = () => [
  { month: "January", desktop: Math.random(), mobile: Math.random() },
  { month: "February", desktop: Math.random(), mobile: Math.random() },
  { month: "March", desktop: Math.random(), mobile: Math.random() },
  { month: "April", desktop: Math.random(), mobile: Math.random() },
  { month: "May", desktop: Math.random(), mobile: Math.random() },
  { month: "June", desktop: Math.random(), mobile: Math.random() },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function ExampleBar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Vulnerabilities</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData()}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}

const EmptyOverview: FunctionComponent<Props> = ({
  title,
  description,
  buttonTitle,
  onClick,
}) => {
  return (
    <div className="relative">
      <div className="mt-5 grid grid-cols-3 flex-col gap-4 opacity-60">
        <div className="blur-sm">
          <ExampleBar />
        </div>
        <div className="blur-sm">
          <ExamplePie />
        </div>
        <div className="blur-sm">
          <ExampleBar />
        </div>
        <div className="col-span-3  blur-sm">
          <ExampleArea />
        </div>
      </div>
      <div className="absolute top-1/3 w-full -translate-y-1/2 flex-row justify-center text-center">
        <div className="relative flex flex-row justify-center">
          <div className="relative z-10 flex flex-col">
            <div className="absolute -inset-10 z-0 bg-background blur-3xl" />
            <h2 className="relative text-2xl font-semibold">{title}</h2>
            <div className="relative flex flex-row justify-center">
              <p className="mt-2 w-full text-muted-foreground">{description}</p>
            </div>
            <div className="relative mt-6">
              <Button onClick={onClick}>{buttonTitle}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyOverview;

const chartData1 = [
  { browser: "chrome", visitors: 275, fill: "hsl(var(--chart-1))" },
  { browser: "safari", visitors: 200, fill: "hsl(var(--chart-2))" },
];

const chartConfig1 = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function ExamplePie() {
  const totalVisitors = React.useMemo(() => {
    return chartData1.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig1}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <Pie
              data={chartData1}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            ></Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}

import { Area, AreaChart } from "recharts";

const chartData2 = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig2 = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function ExampleArea() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart - Stacked</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <ChartContainer className="min-h-[200px]" config={chartConfig2}>
            <AreaChart
              accessibilityLayer
              data={chartData2}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />

              <Area
                dataKey="mobile"
                type="natural"
                fill="var(--color-mobile)"
                fillOpacity={0.4}
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
