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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getApiClientFromContext } from "@/services/devGuardApi";
import { DependencyTreeNode, VulnDTO } from "@/types/api/api";
import { ViewDependencyTreeNode } from "@/types/view/assetTypes";
import { classNames, toSearchParams } from "@/utils/common";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useAssetBranchesAndTags } from "../../../../../../../../../hooks/useActiveAssetVersion";

const DependencyGraphPage: FunctionComponent<{
  graph: { root: ViewDependencyTreeNode };
  flaws: Array<VulnDTO>;
}> = ({ graph, flaws }) => {
  const { branches, tags } = useAssetBranchesAndTags();

  const dimensions = useDimensions();

  const router = useRouter();
  const pathname = usePathname();

  const [isDependencyGraphFullscreen, setIsDependencyGraphFullscreen] =
    useState(false);

  const all = router.query.all === "1";
  const menu = useAssetMenu();

  const addVersionAndscannerQueryParams = (link: string): string => {
    const version = router.query.version as string | undefined;
    const scanner = router.query.scanner as string | undefined;
    if (version && scanner) {
      return `${link}?version=${version}&scanner=${scanner}`;
    }

    if (version) {
      return `${link}?version=${version}`;
    }

    if (scanner) {
      return `${link}?scanner=${scanner}`;
    }

    return link;
  };

  return (
    <Page Menu={menu} Title={<AssetTitle />} title="Dependencies">
      <BranchTagSelector branches={branches} tags={tags} />
      <Section
        primaryHeadline
        forceVertical
        title="Dependency Graph"
        description="This graph shows the dependencies of the asset. The risk of each dependency is calculated based on the risk of the affected package."
      >
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-4">
            <Tabs
              defaultValue={
                (router.query.scanner as string | undefined) ??
                "github.com/l3montree-dev/devguard/cmd/devguard-scanner/sca"
              }
            >
              <TabsList>
                <TabsTrigger
                  onClick={() =>
                    router.push({
                      query: {
                        ...router.query,
                        scanner:
                          "github.com/l3montree-dev/devguard/cmd/devguard-scanner/sca",
                      },
                    })
                  }
                  value="github.com/l3montree-dev/devguard/cmd/devguard-scanner/sca"
                >
                  Application
                </TabsTrigger>
                <TabsTrigger
                  onClick={() =>
                    router.push({
                      query: {
                        ...router.query,
                        scanner:
                          "github.com/l3montree-dev/devguard/cmd/devguard-scanner/container-scanning",
                      },
                    })
                  }
                  value="github.com/l3montree-dev/devguard/cmd/devguard-scanner/container-scanning"
                >
                  Container Image
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-row items-center gap-4">
            {graph.root.risk !== 0 && (
              <div className="flex flex-row items-center gap-4 whitespace-nowrap text-sm">
                <label htmlFor="allDependencies">
                  Display all dependencies
                </label>
                <Switch
                  id="allDependencies"
                  checked={all}
                  onCheckedChange={(onlyRisk) => {
                    router.push(
                      {
                        query: {
                          ...router.query,
                          all: all ? undefined : "1",
                        },
                      },
                      undefined,
                      { scroll: false },
                    );
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
          <DependencyGraph
            flaws={flaws}
            width={dimensions.width - SIDEBAR_WIDTH}
            height={dimensions.height - HEADER_HEIGHT - 85}
            graph={graph}
          />
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
      assetVersionSlug +
      "/";

    // check for version query parameter
    const version = context.query.version as string | undefined;

    //TODO: Fix this
    const scanner = context.query.scanner;
    if (!scanner) {
      context.query.scanner = "sca";
    }

    const [resp, flawResp] = await Promise.all([
      apiClient(
        uri +
          "dependency-graph?" +
          toSearchParams({
            all: context.query.all === "1" ? "1" : undefined,
            version: version,
            scanner:
              context.query.scanner ??
              "github.com/l3montree-dev/devguard/cmd/devguard-scanner/sca",
          }),
      ),
      apiClient(
        uri +
          "affected-components?" +
          toSearchParams({
            version: version,
            scanner:
              context.query.scanner ??
              "github.com/l3montree-dev/devguard/cmd/devguard-scanner/sca",
          }),
      ),
    ]);

    // fetch a personal access token from the user

    const [graph, flaws] = await Promise.all([
      resp.json() as Promise<{ root: DependencyTreeNode }>,
      flawResp.json() as Promise<Array<VulnDTO>>,
    ]);

    let converted = convertGraph(graph.root);

    recursiveAddRisk(converted, flaws);
    // we cannot return a circular data structure - remove the parent again
    recursiveRemoveParent(converted);

    // this wont remove anything, if the root node has 0 risk - thats not a bug, its a feature :)
    if (context.query.all !== "1") {
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

    return {
      props: {
        graph: { root: converted },
        flaws,
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
  },
);
