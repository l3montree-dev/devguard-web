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

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

export function VulnerableComponents({ data }: { data: ComponentRisk }) {
  const d = Object.entries(data)
    .toSorted((a, b) => b[1] - a[1])
    .map(([componentName, risk]) => ({
      componentName,
      risk,
    }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Vulnerable Components</CardTitle>
        <CardDescription>
          The following components have the highest risk score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {d.slice(0, 5).map((item, i, arr) => (
            <div
              key={item.componentName}
              className={classNames(
                i === 0
                  ? "border-b pb-4"
                  : i === arr.length - 1
                    ? "pt-4"
                    : "border-b py-4",
                "flex flex-row gap-4",
              )}
            >
              <div className="border border-foreground/20 rounded-lg bg-muted flex items-center justify-center w-11 h-11">
                <EcosystemImage size={30} packageName={item.componentName} />
              </div>
              <div>
                <div className="mb-1 flex flex-row items-center gap-2 text-sm font-semibold">
                  <span className="capitalize">
                    {beautifyPurl(item.componentName)}
                  </span>
                  <div className="flex flex-row flex-wrap gap-2">
                    <Badge variant={"secondary"}>
                      {item.risk.toFixed(2)} Risk
                    </Badge>
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
