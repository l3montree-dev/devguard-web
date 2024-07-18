import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../../../components/Page";

import { middleware } from "@/decorators/middleware";

import { Badge } from "@/components/ui/badge";
import { withOrganization } from "@/decorators/withOrganization";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import Link from "next/link";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { browserApiClient, getApiClientFromContext } from "../../../../services/devGuardApi";
import { AssetDTO, ProjectDTO } from "../../../../types/api/api";

import Section from "@/components/common/Section";
import { ProjectForm } from "@/components/project/ProjectForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { withProject } from "@/decorators/withProject";
import { useActiveProject } from "@/hooks/useActiveProject";


interface Props {
  project: ProjectDTO 
}

const Index: FunctionComponent<Props> = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const projectMenu = useProjectMenu();

  const router = useRouter();

  const form = useForm<ProjectDTO>({ defaultValues: project });

  const handleUpdate = async (data: Partial<ProjectDTO>) => {
  
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/projects/" + project!.slug + "/",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    if (!resp.ok) {
      console.error("Failed to update project");
    }

    // check if the slug changed - if so, redirect to the new slug
    const newProject = await resp.json();
    if (newProject.slug !== project!.slug) {
      router.push(
        "/"+ activeOrg.slug + "/projects/" + newProject.slug + "/settings",
      );
    }
    
  };



  return (
    <Page
      title={project?.name || ""}
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
            href={`/${activeOrg.slug}/projects/${project!.slug}`}
          >
            {project?.name}
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
      <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-semibold">Project Settings</h1>
        </div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(handleUpdate)}>
        <Section title="General" description="General Settings of the project"  >
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

    return {
      props: {
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
 
 
  },
);

export default Index;
