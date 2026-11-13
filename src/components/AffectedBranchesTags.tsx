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
import { compareSemver, parseSemver } from "@/services/versionCheck";
import type { AssetVersionDTO } from "@/types/dto";
import { useMemo } from "react";
import DateString from "./common/DateString";

// the latest tag of every minor version, newest first, followed by the tags which are no semver by creation date
function latestTags(tags: AssetVersionDTO[]): AssetVersionDTO[] {
  const semverTags: { tag: AssetVersionDTO; version: number[] }[] = [];
  const other: AssetVersionDTO[] = [];
  for (const tag of tags) {
    const version = parseSemver(tag.name);
    if (version) {
      semverTags.push({ tag, version });
    } else {
      other.push(tag);
    }
  }

  // a version line which only has release candidates was never released
  const releases = semverTags.filter(
    ({ tag }) => !/^v?\d+\.\d+\.\d+-/.test(tag.name),
  );
  const candidates = releases.length > 0 ? releases : semverTags;

  const seenMinors = new Set<string>();
  const latestOfMinor: AssetVersionDTO[] = [];
  // newest first, so the first tag of a minor version is its latest
  for (const { tag, version } of candidates.toSorted((a, b) =>
    compareSemver(b.tag.name, a.tag.name),
  )) {
    const minor = `${version[0]}.${version[1]}`;
    if (!seenMinors.has(minor)) {
      seenMinors.add(minor);
      latestOfMinor.push(tag);
    }
  }

  return [
    ...latestOfMinor,
    ...other.toSorted(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    ),
  ];
}

const noVulns: RefDistribution = { low: 0, medium: 0, high: 0, critical: 0 };

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

  const refByName = useMemo(
    () => Object.fromEntries((asset?.refs ?? []).map((ref) => [ref.name, ref])),
    [asset?.refs],
  );

  const d: Array<{
    refName: string;
    refSlug: string;
    dist: RefDistribution;
    createdAt?: string; // not set for branches - there is no release time there.
  }> = useMemo(() => {
    if (type === "tag") {
      // a tag without vulnerabilities has no distribution, but can still be the latest tag
      return latestTags(
        (asset?.refs ?? []).filter((ref) => ref.type === "tag"),
      ).map((tag) => ({
        refName: tag.name,
        refSlug: tag.slug,
        dist: data[tag.name] ?? noVulns,
        createdAt: tag.createdAt,
      }));
    }
    return Object.entries(data)
      .map(([refName, dist]) => ({
        refName,
        refSlug: refByName[refName].slug,
        dist,
      }))
      .filter(({ refName }) => refByName[refName]?.type === type)
      .toSorted(
        (a, b) =>
          b.dist.critical - a.dist.critical ||
          b.dist.high - a.dist.high ||
          b.dist.medium - a.dist.medium ||
          b.dist.low - a.dist.low,
      );
  }, [data, type, refByName, asset?.refs]);

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle className="relative text-base w-full">
          {type == "branch" ? "Most affected Branches" : "Latest Tags"}
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
            : "The latest tag of every minor version"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex -mt-4 flex-col">
          {isLoading ? (
            Array.from(Array(5).keys()).map((_, i, arr) => (
              <Skeleton
                className={classNames(
                  "h-[46px]",
                  i === arr.length - 1 ? "mt-4" : "border-b my-4",
                )}
                key={i}
              />
            ))
          ) : !d.length ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 py-10 text-center">
              <span className="text-sm font-semibold">
                {type == "branch" ? "No affected branches" : "No tags"}
              </span>
              <span className="text-sm text-muted-foreground">
                {type == "branch"
                  ? "Branches appear once vulnerabilities have been found"
                  : "Tags appear once they have been scanned"}
              </span>
            </div>
          ) : (
            d.slice(0, 5).map((item, i, arr) => {
              const href = `/${org?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${item.refSlug}`;

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
                        {item.createdAt && (
                          <>
                            , <DateString date={new Date(item.createdAt)} />
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
