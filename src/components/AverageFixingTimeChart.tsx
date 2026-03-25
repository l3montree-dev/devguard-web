import { FunctionComponent } from "react";

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
          <CardTitle className="text-base">{title}</CardTitle>
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
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="flex flex-col items-center justify-center flex-1 gap-1">
          {hasData ? (
            <>
              <span className="text-3xl font-semibold">{duration}</span>
              <span className="text-sm text-muted-foreground">{type}</span>
            </>
          ) : (
            <>
              <span className="text-3xl text-muted-foreground">∞</span>
              <span className="text-sm text-muted-foreground">No data yet</span>
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
