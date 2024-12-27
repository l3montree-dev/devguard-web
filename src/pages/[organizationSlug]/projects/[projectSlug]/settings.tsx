import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../../../components/Page";

import { middleware } from "@/decorators/middleware";

import { withOrganization } from "@/decorators/withOrganization";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../../../../services/devGuardApi";
import { ProjectDTO } from "../../../../types/api/api";

import { ProjectForm } from "@/components/project/ProjectForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { withProject } from "@/decorators/withProject";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useStore } from "@/zustand/globalStoreProvider";

import { withContentTree } from "@/decorators/withContentTree";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CopyInput from "../../../../components/common/CopyInput";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import Section from "../../../../components/common/Section";
import { Label } from "../../../../components/ui/label";
import { convertRepos } from "../../../../hooks/useRepositorySearch";
import ConnectToRepoSection from "../../../../components/ConnectToRepoSection";

interface Props {
  project: ProjectDTO;
  repositories: Array<{ value: string; label: string }> | null;
}

const Index: FunctionComponent<Props> = ({ repositories }) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const updateProject = useStore((s) => s.updateProject);

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

    toast("Success", {
      description: "Project updated",
    });
    // check if the slug changed - if so, redirect to the new slug
    const newProject = await resp.json();
    updateProject(newProject);

    if (newProject.slug !== project!.slug) {
      router.push(
        "/" + activeOrg.slug + "/projects/" + newProject.slug + "/settings",
      );
    }
  };

  return (
    <Page
      title={project?.name || ""}
      Menu={projectMenu}
      Title={<ProjectTitle />}
    >
      <div>
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-semibold">Project Settings</h1>
        </div>

        <Section title="Information">
          <Label>Project ID</Label>
          <CopyInput value={project?.id ?? ""} />
        </Section>
        <ConnectToRepoSection
          repositories={repositories}
          onUpdate={handleUpdate}
          repositoryId={project?.repositoryId}
          repositoryName={project?.repositoryName}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <ProjectForm forceVerticalSections={false} form={form} />
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
    const { organizationSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);

    const resp = await apiClient(
      "/organizations/" + organizationSlug + "/integrations/repositories",
    );

    let repos: Array<{ value: string; label: string }> | null = null;
    if (resp.ok) {
      repos = convertRepos(await resp.json());
    }

    return {
      props: {
        repositories: repos,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    contentTree: withContentTree,
  },
);

export default Index;
