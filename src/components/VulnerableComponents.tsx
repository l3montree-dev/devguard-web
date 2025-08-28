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
import { Badge } from "./ui/badge";
import EcosystemImage from "./common/EcosystemImage";
import { useViewMode } from "../hooks/useViewMode";
import { useCallback, useMemo } from "react";
import CVERainbowBadge from "./CVERainbowBadge";

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

const sortRisk =
  (viewMode: "risk" | "cvss") =>
  (a: ComponentRisk[string], b: ComponentRisk[string]) => {
    if (viewMode === "cvss") {
      if (a.criticalCvss !== b.criticalCvss) {
        return b.criticalCvss - a.criticalCvss;
      }
      if (a.highCvss !== b.highCvss) {
        return b.highCvss - a.highCvss;
      }
      if (a.mediumCvss !== b.mediumCvss) {
        return b.mediumCvss - a.mediumCvss;
      }
      return b.lowCvss - a.lowCvss;
    }

    // critical > high > medium > low
    if (a.critical !== b.critical) {
      return b.critical - a.critical;
    }
    if (a.high !== b.high) {
      return b.high - a.high;
    }
    if (a.medium !== b.medium) {
      return b.medium - a.medium;
    }
    return b.low - a.low;
  };

export function VulnerableComponents({
  data,
  mode,
}: {
  data: ComponentRisk;
  mode: "risk" | "cvss";
}) {
  const d = useMemo(() => {
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
          {d.slice(0, 5).map((item, i, arr) => (
            <div
              key={item.componentName}
              className={classNames(
                i === arr.length - 1 ? "pt-4" : "border-b py-4",
                "flex flex-row items-center gap-4",
              )}
            >
              <div className="border border-foreground/20 rounded-lg bg-muted flex items-center justify-center w-8 h-8">
                <EcosystemImage size={24} packageName={item.componentName} />
              </div>
              <div>
                <div className="mb-1 flex flex-row items-center gap-2 text-sm font-semibold">
                  <span className="capitalize">
                    {beautifyPurl(item.componentName)}
                  </span>
                  <div className="flex flex-row flex-wrap gap-2">
                    <CVERainbowBadge
                      low={mode === "risk" ? item.risk.low : item.risk.lowCvss}
                      medium={
                        mode === "risk"
                          ? item.risk.medium
                          : item.risk.mediumCvss
                      }
                      high={
                        mode === "risk" ? item.risk.high : item.risk.highCvss
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
