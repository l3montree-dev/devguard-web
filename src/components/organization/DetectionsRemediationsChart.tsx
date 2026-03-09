"use client";
import { FunctionComponent } from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  detections: {
    label: "Detections",
    color: "red",
  },
  remediations: {
    label: "Remediations",
    color: "green",
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
  const chartData = [
    {
      detections: weeklyDetections,
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
        <CardTitle>Detections vs Remediations</CardTitle>
        <CardDescription>
          Average weekly detections vs remediations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={140}
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
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {weeklyDetections.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
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
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="remediations"
              fill="var(--color-remediations)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
            <ChartLegend className="mt-8" content={<ChartLegendContent />} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DetectionsRemediationsChart;
