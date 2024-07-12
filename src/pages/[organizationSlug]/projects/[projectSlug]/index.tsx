import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../../../components/Page";

import { middleware } from "@/decorators/middleware";

import { Badge } from "@/components/ui/badge";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import Link from "next/link";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { getApiClientFromContext } from "../../../../services/devGuardApi";
import { AssetDTO, ProjectDTO } from "../../../../types/api/api";
import { withOrganization } from "@/decorators/withOrganization";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
}

const Index: FunctionComponent<Props> = ({ project }) => {
  const activeOrg = useActiveOrg();
  const projectMenu = useProjectMenu();

  return (
    <Page
      title={project.name}
      Menu={projectMenu}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}`}
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
          >
            {activeOrg.name}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Organization
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project.slug}`}
          >
            {project.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Project
            </Badge>
          </Link>
        </span>
      }
    ></Page>
  );
};

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug } = context.params!;
    const apiClient = getApiClientFromContext(context);
    const resp = await apiClient(
      "/organizations/" + organizationSlug + "/projects/" + projectSlug + "/",
    );

    const project = await resp.json();

    return {
      props: {
        project,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
  },
);

export default Index;
