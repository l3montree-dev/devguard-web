"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";

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
import { AssetFlaws } from "@/types/api/api";
import Link from "next/link";
import { Button } from "../ui/button";

const chartConfig = {
  rawRiskAssessment: {
    label: "Risk",
    color: "red",
  },
} satisfies ChartConfig;

// Custom tooltip content to display only the "Risk" data
const CustomTooltipContent = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${chartConfig.rawRiskAssessment.label}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export function FlawsDiagram({ data }: { data: AssetFlaws[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risks Distribution</CardTitle>
        <CardDescription>
          All flaws that are in the red area should be addressed first
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="flawId"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              hide // Hide the XAxis
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickCount={8}
              domain={[0, 10]}
            />

            <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
            <Area
              dataKey="rawRiskAssessment"
              type="natural"
              fill="var(--color-rawRiskAssessment)"
              fillOpacity={0.5}
              stroke="var(--color-rawRiskAssessment)"
              dot={{
                fill: "var(--color-rawRiskAssessment)",
                r: 6,
              }}
              activeDot={{
                r: 6,
              }}
            />

            <Area
              dataKey={() => 4}
              type="linear"
              fillOpacity={0.5}
              dot={false}
              fill="blue"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              As less critical, all flaws with a risk value of less than 4 are
              considered here.
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground"></div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
