"use client";
import { FunctionComponent } from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  detections: {
    label: "Detections",
    color: "hsl(0 84% 60%)",
  },
  remediations: {
    label: "Remediations",
    color: "hsl(142 71% 45%)",
  },
} satisfies ChartConfig;

interface ChartProps {
  weeklyDetections: number;
  weeklyRemediations: number;
}

const DetectionsRemediationsChart: FunctionComponent<ChartProps> = ({
  weeklyDetections,
  weeklyRemediations,
}) => {
  const spacer = Math.max(weeklyDetections, weeklyRemediations) * 0.03 || 1;
  const chartData = [
    {
      detections: weeklyDetections,
      gap: spacer,
      remediations: Math.max(
        weeklyRemediations,
        Math.round(weeklyDetections / 15),
      ),
      actualDetections: weeklyDetections,
      actualRemediations: weeklyRemediations,
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">Detections vs Remediations</CardTitle>
        <CardDescription>
          Average weekly detections vs remediations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center pb-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-w-[280px] [aspect-ratio:2/1]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={140}
            cx="50%"
            cy="85%"
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => {
                    name = name as string;
                    const actual =
                      name === "detections"
                        ? item.payload.actualDetections
                        : item.payload.actualRemediations;
                    const displayName = name[0].toUpperCase() + name.slice(1);
                    return (
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">
                          {displayName}
                        </span>
                        <span>{actual}</span>
                      </div>
                    );
                  }}
                />
              }
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 24}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {weeklyDetections.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 6}
                          className="fill-muted-foreground text-xs"
                        >
                          Detections
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="detections"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-detections)"
              fillOpacity={0.2}
              stroke="var(--color-detections)"
              strokeWidth={2}
            />
            <RadialBar
              dataKey="gap"
              stackId="a"
              fill="transparent"
              stroke="transparent"
            />
            <RadialBar
              dataKey="remediations"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-remediations)"
              fillOpacity={0.2}
              stroke="var(--color-remediations)"
              strokeWidth={2}
            />
            <ChartLegend className="mt-8" content={<ChartLegendContent />} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DetectionsRemediationsChart;
