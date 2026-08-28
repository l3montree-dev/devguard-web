// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import DependencyGraph from "@/components/DependencyGraph";
import Page from "@/components/Page";
import { Switch } from "@/components/ui/switch";
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "@/const/viewConstants";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useDependencyGraph } from "@/hooks/useDependencyGraph";
import useDimensions from "@/hooks/useDimensions";
import type { DependencyVuln, MinimalDependencyTree } from "@/types/api/api";
import { toSearchParams } from "@/utils/common";
import { Loader2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { FunctionComponent } from "react";
import useSWR from "swr";
import { useArtifacts } from "../../../../../../../../../../../context/AssetVersionContext";
import { fetcher } from "../../../../../../../../../../../data-fetcher/fetcher";
import { useAssetBranchesAndTags } from "../../../../../../../../../../../hooks/useActiveAssetVersion";
import useDecodedParams from "../../../../../../../../../../../hooks/useDecodedParams";
import useRouterQuery from "../../../../../../../../../../../hooks/useRouterQuery";
import RootNodeSelector from "@/components/RootNodeSelector";

const DependencyGraphPage: FunctionComponent = () => {
  const searchParams = useSearchParams();
  const { branches, tags } = useAssetBranchesAndTags();
  const dimensions = useDimensions();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const all = searchParams?.get("all") === "1";
  const menu = useAssetMenu();
  const artifacts = useArtifacts();

  const uri =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/refs/" +
    assetVersionSlug;

  // fetch a personal access token from the user

  const { data: affectedComponents } = useSWR<DependencyVuln[]>(
    uri + "/affected-components/",
    fetcher,
  );

  const { data: graphData } = useSWR<MinimalDependencyTree>(
    uri +
      "/dependency-graph/?" +
      toSearchParams({
        artifactName: searchParams?.get("artifact") ?? undefined,
        origin: searchParams?.get("origin") ?? undefined,
        all: searchParams?.get("all") ? "1" : undefined,
      }),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );

  const graph = useDependencyGraph(
    graphData,
    affectedComponents ?? [],
    searchParams?.get("all") === "1",
  );

  const push = useRouterQuery();

  return (
    <Page Menu={menu} Title={<AssetTitle />} title="Dependencies">
      <BranchTagSelector branches={branches} tags={tags} />
      <Section
        primaryHeadline
        forceVertical
        title="Dependency Graph"
        description="This graph shows the dependencies of the asset. The risk of each dependency is calculated based on the risk of the affected package and accumulated of the risk of the children. You can click on the nodes to see more details about the dependency and the vulnerabilities."
      >
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-4">
            <QueryArtifactSelector
              unassignPossible={true}
              artifacts={(artifacts ?? []).map((a) => a.artifactName)}
            />

            <RootNodeSelector />
          </div>
          <div className="flex flex-row items-center gap-4">
            {graph && graph.risk !== 0 && (
              <div className="flex flex-row items-center gap-4 whitespace-nowrap text-sm">
                <label htmlFor="allDependencies">
                  Display all dependencies
                </label>
                <Switch
                  id="allDependencies"
                  checked={all}
                  onCheckedChange={() => {
                    push({
                      all: all ? undefined : "1",
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className={"h-screen w-full rounded-lg border bg-muted"}>
          {graph ? (
            <DependencyGraph
              vulns={affectedComponents ?? []}
              width={dimensions.width - SIDEBAR_WIDTH}
              height={dimensions.height - HEADER_HEIGHT - 85}
              graph={graph}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <Loader2Icon className="animate-spin h-5 w-auto m-2" />
            </div>
          )}
        </div>
      </Section>
    </Page>
  );
};

export default DependencyGraphPage;
