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
import Link from "next/link";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveAssetVersion } from "../hooks/useActiveAssetVersion";

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
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

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
        <CardTitle className="relative w-full">
          Vulnerable Components
          <Link
            href={`/${org?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/dependency-risks`}
            className="absolute right-0 top-0 text-xs !text-muted-foreground"
          >
            See all
          </Link>
        </CardTitle>
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
            : d.slice(0, 5).map((item, i, arr) => {
                const searchQuery = encodeURIComponent(
                  beautifyPurl(item.componentName),
                );
                const href = `/${org?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/dependency-risks?search=${searchQuery}`;

                return (
                  <Link
                    key={item.componentName}
                    href={href}
                    className="no-underline hover:bg-accent/70 transition-colors rounded-lg -mx-2 px-2 block !text-foreground"
                  >
                    <div
                      className={classNames(
                        i === arr.length - 1 ? "pt-4" : "border-b py-4",
                        "flex flex-row items-center gap-4",
                      )}
                    >
                      <div className="border border-foreground/20 rounded-lg p-1 bg-muted flex items-center justify-center w-8 h-8 aspect-square">
                        <EcosystemImage
                          size={20}
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
                                mode === "risk"
                                  ? item.risk.low
                                  : item.risk.lowCvss
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
                  </Link>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}
