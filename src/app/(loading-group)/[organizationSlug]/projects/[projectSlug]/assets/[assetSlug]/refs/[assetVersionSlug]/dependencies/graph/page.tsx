// Copyright (C) 2024 Tim Bastin, l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
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
import useDimensions from "@/hooks/useDimensions";
import { DependencyVuln, MinimalDependencyTree } from "@/types/api/api";
import { classNames, toSearchParams } from "@/utils/common";
import { Loader2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FunctionComponent, useMemo } from "react";
import useSWR from "swr";
import { useArtifacts } from "../../../../../../../../../../../context/AssetVersionContext";
import { fetcher } from "../../../../../../../../../../../data-fetcher/fetcher";
import { useAssetBranchesAndTags } from "../../../../../../../../../../../hooks/useActiveAssetVersion";
import useDecodedParams from "../../../../../../../../../../../hooks/useDecodedParams";
import useRouterQuery from "../../../../../../../../../../../hooks/useRouterQuery";
import {
  minimalTreeToViewDependencyTreeNode,
  recursiveAddRisk,
  recursiveRemoveWithoutRisk,
} from "../../../../../../../../../../../utils/dependencyGraphHelpers";

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
        all: searchParams?.get("all") ? "1" : undefined,
      }),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );

  const graph = useMemo(() => {
    if (!graphData) {
      return null;
    }

    let converted = minimalTreeToViewDependencyTreeNode(graphData);

    recursiveAddRisk(converted, affectedComponents ?? []);

    // this wont remove anything, if the root node has 0 risk - thats not a bug, its a feature :)
    if (searchParams?.get("all") !== "1") {
      recursiveRemoveWithoutRisk(converted);
    }

    return converted;
  }, [graphData, searchParams, affectedComponents]);

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

        <div
          className={classNames(
            "h-screen w-full rounded-lg border bg-white dark:bg-black",
          )}
        >
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
