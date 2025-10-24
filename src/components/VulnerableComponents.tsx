"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComponentRisk } from "@/types/api/api";
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import { useMemo } from "react";
import { sortRisk } from "../utils/view";
import EcosystemImage from "./common/EcosystemImage";
import CVERainbowBadge from "./CVERainbowBadge";
import { Skeleton } from "./ui/skeleton";

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

export function VulnerableComponents({
  data,
  mode,
  isLoading,
}: {
  data?: ComponentRisk;
  isLoading: boolean;
  mode: "risk" | "cvss";
}) {
  const d = useMemo(() => {
    if (!data) {
      return [];
    }
    const sorter = sortRisk(mode);
    return Object.entries(data)
      .toSorted((a, b) => sorter(a[1], b[1]))
      .map(([componentName, risk]) => ({
        componentName,
        risk,
      }));
  }, [mode, data]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Vulnerable Components</CardTitle>
        <CardDescription>
          The following components have the highest risk score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex -mt-4 flex-col">
          {isLoading
            ? Array.from(Array(5).keys()).map((_, i, arr) => (
                <Skeleton
                  className={classNames(
                    "h-[46px]",
                    i === arr.length - 1 ? "mt-4" : "border-b my-4",
                  )}
                  key={i}
                />
              ))
            : d.slice(0, 5).map((item, i, arr) => (
                <div
                  key={item.componentName}
                  className={classNames(
                    i === arr.length - 1 ? "pt-4" : "border-b py-4",
                    "flex flex-row items-center gap-4",
                  )}
                >
                  <div className="border border-foreground/20 rounded-lg bg-muted flex items-center justify-center w-8 h-8">
                    <EcosystemImage
                      size={24}
                      packageName={item.componentName}
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex flex-row items-center gap-2 text-sm font-semibold">
                      <span className="">
                        {beautifyPurl(item.componentName)}
                      </span>
                      <div className="flex flex-row flex-wrap gap-2">
                        <CVERainbowBadge
                          low={
                            mode === "risk" ? item.risk.low : item.risk.lowCvss
                          }
                          medium={
                            mode === "risk"
                              ? item.risk.medium
                              : item.risk.mediumCvss
                          }
                          high={
                            mode === "risk"
                              ? item.risk.high
                              : item.risk.highCvss
                          }
                          critical={
                            mode === "risk"
                              ? item.risk.critical
                              : item.risk.criticalCvss
                          }
                        />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Version {extractVersion(item.componentName)}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
