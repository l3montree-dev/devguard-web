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

import { BranchTagSelector } from "@/components/BranchTagSelector";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import DependencyGraph from "@/components/DependencyGraph";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "@/const/viewConstants";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDimensions from "@/hooks/useDimensions";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/devGuardApi";
import { ArtifactDTO, DependencyTreeNode, VulnDTO } from "@/types/api/api";
import { ViewDependencyTreeNode } from "@/types/view/assetTypes";
import { classNames, toSearchParams } from "@/utils/common";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

import { useRouter } from "next/compat/router";
import { FunctionComponent, useEffect, useState } from "react";

import { QueryArtifactSelector } from "@/components/ArtifactSelector";
import { withAssetVersion } from "@/decorators/withAssetVersion";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { Loader2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  useActiveAssetVersion,
  useAssetBranchesAndTags,
} from "../../../../../../../../../../hooks/useActiveAssetVersion";
import useRouterQuery from "../../../../../../../../../../hooks/useRouterQuery";

const DependencyGraphPage: FunctionComponent<{
  flaws: Array<VulnDTO>;
  artifacts: ArtifactDTO[];
}> = ({ flaws, artifacts }) => {
  const searchParams = useSearchParams();
  const { branches, tags } = useAssetBranchesAndTags();
  const dimensions = useDimensions();

  const [isDependencyGraphFullscreen, setIsDependencyGraphFullscreen] =
    useState(false);

  const all = searchParams.get("all") === "1";
  const menu = useAssetMenu();

  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const asset = useActiveAsset()!;
  const assetVersion = useActiveAssetVersion();

  const [graph, setGraph] = useState<ViewDependencyTreeNode | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!activeOrg || !project || !asset || !assetVersion) {
        return;
      }
      const resp = await browserApiClient(
        `/organizations/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${assetVersion.slug}/dependency-graph/?` +
          toSearchParams({
            artifactName: searchParams.get("artifact") as string,
            all: searchParams.get("all") ? "1" : undefined,
          }),
        {
          method: "GET",
        },
      );

      if (resp.ok) {
        const json = await resp.json();
        let converted = convertGraph(json.root);
        recursiveAddRisk(converted, flaws);
        // we cannot return a circular data structure - remove the parent again
        recursiveRemoveParent(converted);

        // this wont remove anything, if the root node has 0 risk - thats not a bug, its a feature :)
        if (searchParams.get("all") !== "1") {
          recursiveRemoveWithoutRisk(converted);
        }

        // the first childrens are the detection targets.
        // they might start with the asset id itself.
        // if there is only a first level child, which starts with the asset id, we can remove the root node
        if (
          converted.children.length === 1 &&
          converted.children[0].name.startsWith(asset.id)
        ) {
          converted = {
            ...converted.children[0],
            name: converted.children[0].name.replace(asset.id + "/", ""),
            parent: null,
          };
        } else {
          // check if thats the case, if so, remove the assetId prefix
          converted.children = converted.children.map((c) => {
            if (c.name.startsWith(asset.id)) {
              c.name = c.name.replace(asset.id + "/", "");
            }
            return c;
          });
        }
        setGraph(converted);
      }
    }
    fetchData();
  }, [flaws, searchParams, activeOrg, project, asset, assetVersion]);

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
            isDependencyGraphFullscreen
              ? "absolute left-0 top-0 z-50 h-screen w-screen"
              : "relative",
          )}
        >
          <div className="absolute right-2 top-2 z-10 flex flex-row justify-end">
            <Button
              onClick={() => setIsDependencyGraphFullscreen((prev) => !prev)}
              variant={"outline"}
              size={"icon"}
            >
              {isDependencyGraphFullscreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </Button>
          </div>

          {graph ? (
            <DependencyGraph
              flaws={flaws}
              width={dimensions.width - SIDEBAR_WIDTH}
              height={dimensions.height - HEADER_HEIGHT - 85}
              graph={{ root: graph }}
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

const RISK_INHERITANCE_FACTOR = 1;
const recursiveAddRisk = (
  node: ViewDependencyTreeNode,
  flaws: Array<VulnDTO>,
) => {
  const nodeFlaws = flaws.filter((p) => p.componentPurl === node.name);

  // if there are no children, the risk is the risk of the affected package
  if (nodeFlaws.length > 0) {
    node.risk = nodeFlaws.reduce(
      (acc, curr) => acc + curr.rawRiskAssessment,
      0,
    );
    // update the parent node with the risk of this node
    let parent = node.parent;
    let i = 0;
    while (parent != null) {
      i++;
      parent.risk = parent.risk
        ? parent.risk + node.risk * (RISK_INHERITANCE_FACTOR / i)
        : node.risk * (RISK_INHERITANCE_FACTOR / i);
      parent = parent.parent;
    }
  }
  node.children.forEach((child) => recursiveAddRisk(child, flaws));

  return node;
};

const recursiveRemoveParent = (node: ViewDependencyTreeNode) => {
  node.parent = null;
  node.children.forEach((child) => recursiveRemoveParent(child));
};

const convertGraph = (
  graph: DependencyTreeNode,
  parent: ViewDependencyTreeNode | null = null,
): ViewDependencyTreeNode => {
  const convertedNode = {
    name: graph.name,
    children: [] as ViewDependencyTreeNode[],
    risk: 0,
    parent,
  };
  convertedNode.children = graph.children.map((child) =>
    convertGraph(child, convertedNode),
  );
  return convertedNode;
};

export const recursiveRemoveWithoutRisk = (node: ViewDependencyTreeNode) => {
  if (node.risk === 0) {
    return null;
  }
  node.children = node.children
    .map(recursiveRemoveWithoutRisk)
    .filter((n): n is ViewDependencyTreeNode => n !== null);
  return node;
};

export const getServerSideProps = middleware(
  async (context, { asset }) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.params!;

    const apiClient = getApiClientFromContext(context);

    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug;

    const [vulnResponse] = await Promise.all([
      apiClient(uri + "/affected-components/"),
    ]);

    // fetch a personal access token from the user

    const [vulns] = await Promise.all([
      vulnResponse.json() as Promise<Array<VulnDTO>>,
    ]);
    let artifactsData: ArtifactDTO[] = [];
    const artifactsResp = await apiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/refs/" +
        assetVersionSlug +
        "/artifacts/",
    );

    if (artifactsResp.ok) {
      artifactsData = await artifactsResp.json();
    }

    return {
      props: {
        flaws: vulns,
        artifacts: artifactsData,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
    contentTree: withContentTree,
    assetVersion: withAssetVersion,
  },
);
