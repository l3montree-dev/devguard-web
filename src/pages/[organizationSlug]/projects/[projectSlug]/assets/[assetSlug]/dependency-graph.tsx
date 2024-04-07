// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import DependencyGraph from "@/components/DependencyGraph";
import Page from "@/components/Page";
import FormField from "@/components/common/FormField";
import { Toggle } from "@/components/common/Toggle";
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "@/const/viewConstants";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrg } from "@/decorators/withOrg";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDimensions from "@/hooks/useDimensions";
import { getApiClientFromContext } from "@/services/flawFixApi";
import { AffectedPackage, DependencyTreeNode } from "@/types/api/api";
import { ViewDependencyTreeNode } from "@/types/view/assetTypes";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";

const DependencyGraphPage: FunctionComponent<{
  graph: { root: ViewDependencyTreeNode };
  affectedPackages: Array<AffectedPackage>;
}> = ({ graph, affectedPackages }) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const dimensions = useDimensions();

  const router = useRouter();
  const onlyRisk = router.query.onlyRisk === "1";
  const menu = useAssetMenu();
  return (
    <Page
      Menu={menu}
      fullscreen
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg?.slug}`}
            className="hover:no-underline text-white"
          >
            {activeOrg?.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="hover:no-underline text-white"
            href={`/${activeOrg?.slug}/projects/${project?.slug}`}
          >
            {project?.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="hover:no-underline text-white"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
          </Link>
          <span className="opacity-75">/</span>
          <span>Dependency Graph</span>
        </span>
      }
      title="Dependency Graph"
    >
      <div className="px-5 py-3 dark:bg-slate-900 bg-white flex-row flex justify-end border-b dark:border-b-slate-800 dark:text-white">
        <FormField
          className="flex flex-row gap-2"
          label="Only show affected packages"
          Element={() => (
            <Toggle
              checked={onlyRisk}
              onChange={(onlyRisk) => {
                router.push({
                  query: {
                    ...router.query,
                    onlyRisk: onlyRisk ? "1" : undefined,
                  },
                });
              }}
            />
          )}
        ></FormField>
      </div>
      <DependencyGraph
        affectedPackages={affectedPackages}
        width={dimensions.width - SIDEBAR_WIDTH}
        height={dimensions.height - HEADER_HEIGHT - 50}
        graph={graph}
      />
    </Page>
  );
};

export default DependencyGraphPage;

const severityToRisk = (severity: string): number => {
  switch (severity) {
    case "CRITICAL":
      return 1;
    case "HIGH":
      return 0.7;
    case "MEDIUM":
      return 0.5;
    case "LOW":
      return 0.3;
    default:
      return 0;
  }
};

const RISK_INHERITANCE_FACTOR = 0.33;
const recursiveAddRisk = (
  node: ViewDependencyTreeNode,
  affected: Array<AffectedPackage>,
) => {
  if (node.children.length === 0) {
    const affectedPackage = affected.find(
      (p) => p.PurlWithVersion === node.name,
    );
    // if there are no children, the risk is the risk of the affected package
    if (affectedPackage) {
      node.risk = severityToRisk(affectedPackage.CVE.severity);
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
  } else {
    node.children.forEach((child) => recursiveAddRisk(child, affected));
  }
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
  async (context) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/";

    const [resp, affectedResp] = await Promise.all([
      apiClient(uri + "dependency-graph/"),
      apiClient(uri + "affected-packages/"),
    ]);

    // fetch a personal access token from the user

    const [graph, affected] = await Promise.all([
      resp.json() as Promise<{ root: DependencyTreeNode }>,
      affectedResp.json() as Promise<Array<AffectedPackage>>,
    ]);

    const converted = convertGraph(graph.root);
    recursiveAddRisk(converted, affected);
    // we cannot return a circular data structure - remove the parent again
    recursiveRemoveParent(converted);

    if (context.query.onlyRisk === "1") {
      recursiveRemoveWithoutRisk(converted);
    }

    return {
      props: {
        graph: { root: converted },
        affectedPackages: affected,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrg,
    project: withProject,
    asset: withAsset,
  },
);
