"use client";

import type { FunctionComponent } from "react";
import {
  Label,
  LabelList,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import { riskToSeverity, severityToColor } from "@/components/common/Severity";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const chartConfig = {
  risk: {
    label: "Risk",
  },
  cvss: {
    label: "CVSS",
  },
} satisfies ChartConfig;

interface RiskSeverityRadialChartProps {
  // Contextual risk assessment (0-10), rendered as the inner ring and center label.
  risk: number;
  // General CVSS base score (0-10), rendered as the outer ring.
  cvss: number;
  className?: string;
}

const RiskSeverityRadialChart: FunctionComponent<
  RiskSeverityRadialChartProps
> = ({ risk, cvss, className }) => {
  // Two concentric rings: the general CVSS base score (muted) and the
  // contextual risk assessment (coloured by its severity bucket). Both scores
  // share the 0-10 angle axis below, so each ring's arc reflects its value.
  const chartData = [
    {
      metric: "cvss",
      label: "CVSS",
      score: cvss,
      fill: "hsl(var(--muted-foreground))",
    },
    {
      metric: "risk",
      label: "Risk",
      score: risk,
      fill: severityToColor(riskToSeverity(risk)),
    },
  ];

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("mx-auto aspect-square max-w-[200px]", className)}
    >
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={-270}
        innerRadius="68%"
        outerRadius="100%"
      >
        {/* Map the 0-10 scores onto the arc length shared by both rings. */}
        <PolarAngleAxis
          type="number"
          domain={[0, 10]}
          tick={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              nameKey="metric"
              formatter={(value, name, item) => {
                // The single "score" series shares one dataKey, so derive the
                // ring name from the row payload instead of the series name.
                const metric = item?.payload?.metric as
                  keyof typeof chartConfig | undefined;
                const label =
                  (metric && chartConfig[metric]?.label) ?? String(name);
                return (
                  <div className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {Number(value).toFixed(1)}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <RadialBar dataKey="score" background cornerRadius={2}>
          <LabelList
            position="insideStart"
            dataKey="label"
            className="fill-foreground mix-blend-luminosity"
            fontSize={10}
          />
        </RadialBar>
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                      y={(viewBox.cy || 0) - 10}
                      className="fill-foreground text-xl font-bold"
                    >
                      {risk.toFixed(1)}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 12}
                      className="fill-muted-foreground"
                    >
                      Risk Estimate
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
};

export default RiskSeverityRadialChart;
