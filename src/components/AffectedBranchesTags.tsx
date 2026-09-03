// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitBranch, TagIcon } from "lucide-react";
import type { RefDistribution } from "@/hooks/useRefDistributions";
import CVERainbowBadge from "./CVERainbowBadge";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { classNames } from "@/utils/common";
import { useMemo } from "react";

export function AffectedBranchesTags({
  data,
  isLoading,
  type,
}: {
  data: Record<string, RefDistribution>;
  isLoading: boolean;
  type: string;
}) {
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  const typeByRefName = useMemo(
    () =>
      Object.fromEntries(
        (asset?.refs ?? []).map((ref) => [ref.name, ref.type]),
      ),
    [asset?.refs],
  );

  const d = useMemo(
    () =>
      Object.entries(data)
        .map(([refName, dist]) => ({ refName, dist }))
        .filter(({ refName }) => typeByRefName[refName] === type)
        .toSorted(
          (a, b) =>
            b.dist.critical - a.dist.critical ||
            b.dist.high - a.dist.high ||
            b.dist.medium - a.dist.medium ||
            b.dist.low - a.dist.low,
        ),
    [data, type, typeByRefName],
  );

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle className="relative text-base w-full">
          {type == "branch" ? "Top 5 affected Branches" : "Top 5 affected Tags"}
          {/* <Link
            href={`#`}
            className="absolute right-0 top-0 text-xs !text-muted-foreground"
          >
            See all
          </Link> */}
        </CardTitle>
        <CardDescription>
          {type == "branch"
            ? "The following branches have the most vulnerabilities"
            : "The following tags have the most vulnerabilities"}
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
                const href = `/${org?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${item.refName}`;

                return (
                  <Link
                    key={item.refName}
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
                        {type == "branch" ? (
                          <GitBranch size={20} />
                        ) : (
                          <TagIcon size={20} />
                        )}
                      </div>
                      <div>
                        <div className="mb-1 flex flex-row items-center gap-2 text-sm font-semibold">
                          <span className="">{item.refName}</span>
                          <div className="flex flex-row flex-wrap gap-2">
                            <CVERainbowBadge
                              low={item.dist.low}
                              medium={item.dist.medium}
                              high={item.dist.high}
                              critical={item.dist.critical}
                            />
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {item.dist.low +
                            item.dist.medium +
                            item.dist.high +
                            item.dist.critical}{" "}
                          vulnerabilities
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
