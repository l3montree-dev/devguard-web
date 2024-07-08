import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../../../components/Page";

import { middleware } from "@/decorators/middleware";

import { useProjectMenu } from "@/hooks/useProjectMenu";
import Link from "next/link";
import { withOrg } from "../../../../decorators/withOrg";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { getApiClientFromContext } from "../../../../services/devGuardApi";
import { AssetDTO, ProjectDTO } from "../../../../types/api/api";

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
            className="!text-white hover:no-underline"
          >
            {activeOrg.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="!text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project.slug}`}
          >
            {project.name}
          </Link>
          <span className="opacity-75">/</span>

          <Link
            className="!text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project.slug}/settings`}
          >
            Settings
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
    organizations: withOrg,
  },
);

export default Index;
