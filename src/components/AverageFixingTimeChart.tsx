import { FunctionComponent } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { classNames } from "../utils/common";
import { getSeverityClassNames } from "./common/Severity";
import { AverageFixingTime } from "../types/api/api";
import { Skeleton } from "./ui/skeleton";

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
        duration: duration.toFixed(0),
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
  averageFixingTimeByCVSS: number | undefined;
  averageFixingTimeByRisk: number | undefined;
  variant: "high" | "medium" | "low" | "critical";
  title: string;
  description: string;
  mode: "risk" | "cvss";
  isLoading: boolean;
}

const AverageFixingTimeChart: FunctionComponent<Props> = ({
  averageFixingTimeByCVSS,
  averageFixingTimeByRisk,
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

  if (!averageFixingTimeByCVSS) {
    averageFixingTimeByCVSS = 0;
  }

  if (!averageFixingTimeByRisk) {
    averageFixingTimeByRisk = 0;
  }

  const seconds =
    mode === "cvss" ? averageFixingTimeByCVSS : averageFixingTimeByRisk;
  const hasData = seconds > 0;

  const { duration, type } = getHumanReadableDuration(seconds);
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="">{title}</CardTitle>
        <CardDescription>{description}.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="flex flex-col items-center justify-center flex-1 gap-1">
          {hasData ? (
            <>
              <span className="text-6xl font-bold">{duration}</span>
              <span className="text-muted-foreground text-sm">{type}</span>
            </>
          ) : (
            <>
              <span className="text-6xl">∞</span>
              <span className="text-muted-foreground text-sm">No data yet</span>
            </>
          )}
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
