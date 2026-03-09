import { FunctionComponent } from "react";
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
} from "recharts";

import { ChartContainer } from "./ui/chart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { classNames, getHumanReadableDuration } from "../utils/common";
import { getSeverityClassNames } from "./common/Severity";
import { AverageFixingTime } from "../types/api/api";
import Loading from "./common/Loading";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface Props {
  avgFixingTime: AverageFixingTime | undefined;
  variant: "high" | "medium" | "low" | "critical";
  title: string;
  description: string;
  mode: "risk" | "cvss";
  isLoading: boolean;
}

const AverageFixingTimeChart: FunctionComponent<Props> = ({
  avgFixingTime,
  title,
  description,
  variant,
  mode,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}. Target Line shows 30 days.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Skeleton className="w-full h-46" />
        </CardContent>
      </Card>
    );
  }

  if (!avgFixingTime) {
    avgFixingTime = {
      averageFixingTimeSeconds: 0,
      averageFixingTimeSecondsByCvss: 0,
    };
  }

  const seconds =
    mode === "cvss"
      ? avgFixingTime.averageFixingTimeSecondsByCvss
      : avgFixingTime.averageFixingTimeSeconds;
  const hasData = seconds > 0;

  const { duration, type } = getHumanReadableDuration(seconds);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="">{title}</CardTitle>
        <CardDescription>{description}.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="-mb-20 relative">
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
                      if (!hasData) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 8}
                              className="fill-foreground text-6xl"
                            >
                              ∞
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 16}
                              className="fill-muted-foreground text-sm"
                            >
                              No data yet
                            </tspan>
                          </text>
                        );
                      }

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
                fill="hsl(var(--secondary))"
                dataKey="should"
                className="stroke-transparent"
              />
              <RadialBar
                dataKey="has"
                cornerRadius={5}
                fill="hsl(var(--primary))"
                className="stroke-2"
              />
              {/* Custom reference line */}
            </RadialBarChart>
          </ChartContainer>
        </div>
        <div className="flex">
          <span
            className={classNames(
              "px-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
              getSeverityClassNames(variant.toUpperCase(), false),
            )}
          >
            {variant.toUpperCase()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AverageFixingTimeChart;
