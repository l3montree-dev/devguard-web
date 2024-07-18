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
import { browserApiClient, getApiClientFromContext } from "../../../../services/devGuardApi";
import { AssetDTO, ProjectDTO } from "../../../../types/api/api";
import { withOrganization } from "@/decorators/withOrganization";

import { useActiveProject } from "@/hooks/useActiveProject";
import { useForm } from "react-hook-form";
import Section from "@/components/common/Section";
import { ProjectForm } from "@/components/project/ProjectForm";
import { Form } from "@/components/ui/form";
import { withProject } from "@/decorators/withProject";
import { useStore } from "@/zustand/globalStoreProvider";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
}

const Index: FunctionComponent<Props> = ({ project }: Props) => {
  const activeOrg = useActiveOrg();
  const projectMenu = useProjectMenu();
  //const updateProject =  useStore((state) => state.updateProject);
  const router = useRouter();

  const form = useForm<ProjectDTO>({ defaultValues: project });

  const handleUpdate = async (data: Partial<ProjectDTO>) => {
    console.log("update project");
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/projects/" + project.slug + "/",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    if (!resp.ok) {
      console.error("Failed to update project");
    }
/*
    const newProject = await resp.json();
    updateProject(newProject);
    if (newProject.slug !== project.slug) {
      router.push(
        "/"+ activeOrg.slug + "/projects/" + newProject.slug + "/settings",
      );
    }
    */
  };



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
    >
      <div>
        Settings
        <Form {...form}>
        <form onSubmit={form.handleSubmit(handleUpdate)}>
        <Section title="Project"  >
          <ProjectForm form={form} />
        </Section>
        <div className="mt-4 flex flex-row justify-end">
              <Button>Update</Button>
            </div>
        </form>
        </Form>
      </div>
    </Page>
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
    organizations: withOrg,
 
  },
);

export default Index;
