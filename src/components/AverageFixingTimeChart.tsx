// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { FunctionComponent } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { classNames, getHumanReadableDuration } from "../utils/common";
import { getSeverityClassNames } from "./common/Severity";
import type { AverageFixingTime } from "@/types/view/vuln";
import { Skeleton } from "./ui/skeleton";

interface Props {
  avgFixingTime: AverageFixingTime | undefined;
  /**
   * Optional secondary metric: the average age of currently open (unremediated)
   * vulns. When provided it is rendered below the remediation time in the same
   * card. Existing single-metric callers can omit it.
   */
  openAge?: AverageFixingTime;
  variant: "high" | "medium" | "low" | "critical";
  title: string;
  description: string;
  mode: "risk" | "cvss";
  isLoading: boolean;
}

const AverageFixingTimeChart: FunctionComponent<Props> = ({
  avgFixingTime,
  openAge,
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

  const openSeconds = openAge
    ? mode === "cvss"
      ? openAge.averageFixingTimeSecondsByCvss
      : openAge.averageFixingTimeSeconds
    : undefined;
  const openHuman =
    openSeconds !== undefined
      ? getHumanReadableDuration(openSeconds)
      : undefined;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex gap-2 justify-end">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}.</CardDescription>
          </div>
          <div className="">
            <span
              className={classNames(
                "px-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
                getSeverityClassNames(variant.toUpperCase(), false),
              )}
            >
              {variant.toUpperCase()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="flex flex-col items-start justify-center flex-1 gap-1">
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
        {openHuman && (
          <div className="mt-4 gap-1 border-t pt-4 text-sm">
            <span className="text-muted-foreground">Avg. age of open: </span>
            {openSeconds && openSeconds > 0 ? (
              <span className="font-medium tabular-nums">
                {openHuman.duration} {openHuman.type}
              </span>
            ) : (
              <span className="text-muted-foreground">no data yet</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AverageFixingTimeChart;
