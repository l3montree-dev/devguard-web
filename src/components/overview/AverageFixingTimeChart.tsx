import { FunctionComponent } from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

function getHumanReadableDuration(seconds: number) {
  const timeUnits = [
    { unit: "year", seconds: 365 * 24 * 60 * 60 },
    { unit: "month", seconds: 30 * 24 * 60 * 60 },
    { unit: "week", seconds: 7 * 24 * 60 * 60 },
    { unit: "day", seconds: 24 * 60 * 60 },
    { unit: "hour", seconds: 60 * 60 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (let i = 0; i < timeUnits.length; i++) {
    const currentUnit = timeUnits[i];
    if (seconds >= currentUnit.seconds) {
      const duration = seconds / currentUnit.seconds;
      return {
        duration: duration.toFixed(2),
        type: currentUnit.unit + (duration > 1 ? "s" : ""),
      };
    }
  }

  // If the input is less than 1 second
  return {
    duration: 0,
    type: "seconds",
  };
}

interface Props {
  avgFixingTime?: {
    averageFixingTimeSeconds: number;
  };
  title: string;
  description: string;
}
const AverageFixingTimeChart: FunctionComponent<Props> = ({
  avgFixingTime,
  title,
  description,
}) => {
  const seconds = avgFixingTime?.averageFixingTimeSeconds ?? 0;
  const days = Math.round(seconds / 60 / 60 / 24);

  const { duration, type } = getHumanReadableDuration(seconds);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="-mb-20">
          <ChartContainer
            config={{
              should: { label: "Should", color: "var(--color-should)" },
              has: { label: "Has", color: "var(--color-has)" },
            }}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart
              data={[
                {
                  should: 60 * 60 * 24 * 30, //4 * 30 * 24 * 60 * 60,
                  has: seconds,
                },
              ]}
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={130}
            >
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
                            {duration}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 4}
                            className="fill-muted-foreground"
                          >
                            {type}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                fill="hsl(var(--muted))"
                dataKey="should"
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="has"
                cornerRadius={5}
                fill="hsl(var(--chart-1))"
                className="stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AverageFixingTimeChart;
