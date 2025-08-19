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
    <Card>
      <CardHeader>
        <CardTitle>Vulnerable Components</CardTitle>
        <CardDescription>
          The following components have the highest risk score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {d.slice(0, 5).map((item, index) => (
            <div
              key={item.componentName}
              className={classNames(
                "flex items-center gap-2",
                "-mx-2 rounded-lg px-2 py-2 !text-card-foreground transition-all",
              )}
            >
              <div className="rounded-full p-2">
                <EcosystemImage size={20} packageName={item.componentName} />
              </div>
              <div className="grid">
                <p className="text-sm font-medium leading-none">
                  {beautifyPurl(item.componentName)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Version {extractVersion(item.componentName)}
                </p>
              </div>
              <div className="ml-auto font-medium">
                <Badge variant={"secondary"}>{item.risk.toFixed(2)} Risk</Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4"></div>
      </CardContent>
    </Card>
  );
}
