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
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "@/const/viewConstants";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrg } from "@/decorators/withOrg";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import useDimensions from "@/hooks/useDimensions";
import { getApiClientFromContext } from "@/services/flawFixApi";
import { DependencyTreeNode } from "@/types/common";
import { FunctionComponent } from "react";

const DependencyGraphPage: FunctionComponent<{
  graph: { root: DependencyTreeNode };
}> = ({ graph }) => {
  const dimensions = useDimensions();
  return (
    <Page fullscreen title="Dependency Graph">
      <DependencyGraph
        width={dimensions.width - SIDEBAR_WIDTH}
        height={dimensions.height - HEADER_HEIGHT}
        graph={graph}
      />
    </Page>
  );
};

export default DependencyGraphPage;

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

    const [resp] = await Promise.all([apiClient(uri + "dependency-graph/")]);

    // fetch a personal access token from the user

    const [graph] = await Promise.all([resp.json()]);

    return {
      props: {
        graph,
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
