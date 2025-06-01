import { GetServerSidePropsContext } from "next";
import { FunctionComponent, useState } from "react";
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
import MembersTable from "../../../../components/MembersTable";
import ProjectMemberDialog from "../../../../components/ProjectMemberDialog";
import CopyInput from "../../../../components/common/CopyInput";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import Section from "../../../../components/common/Section";
import { Label } from "../../../../components/ui/label";
import { convertRepos } from "../../../../hooks/useRepositorySearch";

interface Props {
  project: ProjectDTO;
  repositories: Array<{ value: string; label: string }> | null;
}

const Index: FunctionComponent<Props> = ({ repositories }) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const updateProject = useStore((s) => s.updateProject);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  const handleChangeMemberRole = async (
    id: string,
    role: "admin" | "member",
  ) => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project?.slug +
        "/members/" +
        id,
      {
        method: "PUT",
        body: JSON.stringify({ role }),
      },
    );

    if (resp.ok) {
      updateProject({
        ...project!,
        members: project!.members.map((member) =>
          member.id === id ? { ...member, role } : member,
        ),
      });
      toast.success("Role successfully changed");
    } else {
      toast.error("Failed to update member role");
    }
  };

  const handleDeleteProject = async () => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/projects/" + project!.slug, // can never be null
      {
        method: "DELETE",
      },
    );
    if (resp.ok) {
      toast("Project deleted", {
        description: "The project has been deleted",
      });
      router.push("/" + activeOrg.slug);
    } else {
      toast.error("Could not delete asset");
    }
  };

  const handleRemoveMember = async (id: string) => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project?.slug +
        "/members/" +
        id,
      {
        method: "DELETE",
      },
    );

    if (resp.ok) {
      updateProject({
        ...project!,
        members: project!.members.filter((member) => member.id !== id),
      });
      toast.success("Member deleted");
    } else {
      toast.error("Failed to remove member");
    }
  };

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
        <hr />
        {!project.externalEntityProviderId && (
          <>
            <Section
              title="Member"
              description="Manage the members of your organization"
            >
              <MembersTable
                onChangeMemberRole={handleChangeMemberRole}
                onRemoveMember={handleRemoveMember}
                members={project.members}
              />
              <ProjectMemberDialog
                isOpen={memberDialogOpen}
                onOpenChange={setMemberDialogOpen}
              />

              <div className="flex flex-row justify-end">
                <Button onClick={() => setMemberDialogOpen(true)}>
                  Add Member
                </Button>
              </div>
            </Section>
            <hr />
          </>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <ProjectForm
              disabled={Boolean(project.externalEntityProviderId)}
              onConfirmDelete={
                Boolean(project.externalEntityProviderId)
                  ? undefined
                  : handleDeleteProject
              }
              forceVerticalSections={false}
              form={form}
            />
            <div className="mt-4 flex flex-row justify-end">
              <Button disabled={Boolean(project.externalEntityProviderId)}>
                Update
              </Button>
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
