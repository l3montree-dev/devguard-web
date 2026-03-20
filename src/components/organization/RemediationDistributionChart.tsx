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
import { FunctionComponent } from "react";
import { RemediationTypeUsage } from "@/types/api/api";

interface Props {
  distribution: RemediationTypeUsage | undefined;
}

const chartConfig: ChartConfig = {
  amount: { label: "Amount" },
  fixed: { label: "Fixed", color: "hsl(142 71% 45%)" },
  accepted: { label: "Accepted", color: "hsl(217 91% 60%)" },
  falsePositive: { label: "False Positive", color: "hsl(45 93% 47%)" },
};

const RemediationTypeDistribution: FunctionComponent<Props> = ({
  distribution,
}) => {
  if (!distribution) {
    distribution = {
      acceptedPercentage: 0,
      fixedPercentage: 0,
      falsePositivePercentage: 0,
    };
  }
  const chartData = [
    {
      type: "fixed",
      amount: distribution.fixedPercentage,
      fill: "var(--color-fixed)",
      stroke: "var(--color-fixed)",
    },
    {
      type: "accepted",
      amount: distribution.acceptedPercentage,
      fill: "var(--color-accepted)",
      stroke: "var(--color-accepted)",
    },
    {
      type: "falsePositive",
      amount: distribution.falsePositivePercentage,
      fill: "var(--color-falsePositive)",
      stroke: "var(--color-falsePositive)",
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">Remediation Type Distribution</CardTitle>
        <CardDescription>
          How vulnerabilities are remediated across the organization
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
                const label =
                  chartConfig[entry.type as keyof typeof chartConfig]?.label ??
                  entry.type;
                return (
                  <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="text-muted-foreground mt-1.5 grid gap-0.5 pl-[18px]">
                      <span>Share: {entry.amount.toFixed(1)}%</span>
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
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="type" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RemediationTypeDistribution;
