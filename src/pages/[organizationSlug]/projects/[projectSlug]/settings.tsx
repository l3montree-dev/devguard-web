import { GetServerSidePropsContext } from "next";
import { FunctionComponent, useState } from "react";
import Page from "../../../../components/Page";

import { middleware } from "@/decorators/middleware";

import { withOrganization } from "@/decorators/withOrganization";
import { useProjectMenu } from "@/hooks/useProjectMenu";
import { withOrgs } from "../../../../decorators/withOrgs";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { browserApiClient } from "../../../../services/devGuardApi";
import {
  OrganizationDetailsDTO,
  ProjectDTO,
  UserRole,
  WebhookDTO,
} from "../../../../types/api/api";

import { ProjectForm } from "@/components/project/ProjectForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { withProject } from "@/decorators/withProject";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useStore } from "@/zustand/globalStoreProvider";

import ListItem from "@/components/common/ListItem";
import { WebhookIntegrationDialog } from "@/components/common/WebhookIntegrationDialog";
import { withContentTree } from "@/decorators/withContentTree";
import { getCurrentUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import MembersTable from "../../../../components/MembersTable";
import ProjectMemberDialog from "../../../../components/ProjectMemberDialog";
import CopyInput from "../../../../components/common/CopyInput";
import ProjectTitle from "../../../../components/common/ProjectTitle";
import Section from "../../../../components/common/Section";
import { Label } from "../../../../components/ui/label";

interface Props {}

const Index: FunctionComponent<Props> = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const updateProject = useStore((s) => s.updateProject);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  const handleNewWebhookIntegration = (integration: WebhookDTO) => {
    updateProject({
      ...project,
      webhooks: project.webhooks.concat(integration),
    });
  };

  const handleUpdateWebhookIntegration = (integration: WebhookDTO) => {
    updateProject({
      ...project,
      webhooks: project.webhooks.map((w) =>
        w.id === integration.id ? integration : w,
      ),
    });
  };

  const handleDeleteWebhook = async (id?: string) => {
    if (!id) return;
    const res = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project.slug +
        "/integrations/webhook/" +
        id,
      {
        method: "DELETE",
      },
    );
    if (res.ok) {
      toast.success("Webhook deleted successfully");
      updateProject({
        ...project,
        webhooks: project.webhooks.filter((w) => w.id !== id),
      });
    } else {
      toast.error("Failed to delete webhook");
    }
  };

  const handleChangeMemberRole = async (
    id: string,
    role: UserRole.Admin | UserRole.Member,
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
      toast("Group deleted", {
        description: "The group has been deleted",
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
      description: "Group updated",
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
          <h1 className="text-2xl font-semibold">Group Settings</h1>
        </div>
        <div>
          <Section
            description={
              "Manage the webhooks that are used to connect DevGuard with your Applications."
            }
            title="Webhooks"
          >
            {project.webhooks?.map((installation) => (
              <ListItem
                key={installation.id}
                Title={installation.name}
                Description={installation.description}
                Button={
                  <WebhookIntegrationDialog
                    onNewIntegration={handleUpdateWebhookIntegration}
                    Button={<Button variant={"secondary"}>Edit Webhook</Button>}
                    initialValues={installation}
                    onDeleteWebhook={handleDeleteWebhook}
                    projectWebhook={true}
                  ></WebhookIntegrationDialog>
                }
              />
            ))}

            <hr />
            <ListItem
              Title={
                <div className="flex flex-row items-center">Add a Webhook</div>
              }
              Description="DevGuard uses webhooks to send notifications to your applications. You can use webhooks to receive notifications about events in DevGuard, such as new vulnerabilities, or SBOMs."
              Button={
                <WebhookIntegrationDialog
                  onNewIntegration={handleNewWebhookIntegration}
                  Button={<Button variant={"secondary"}>Add a Webhook</Button>}
                  projectWebhook={true}
                ></WebhookIntegrationDialog>
              }
            />
          </Section>
        </div>
        <hr />
        <Section title="Information">
          <Label>Group ID</Label>
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
  async (
    context: GetServerSidePropsContext,
    { organization, session, project },
  ) => {
    if (organization && "oauth2Error" in organization) {
      return {
        props: {},
      };
    }

    const currentUserRole = getCurrentUserRole(
      session?.identity,
      organization as OrganizationDetailsDTO,
      context.query.projectSlug as string,
      project,
    );

    if (
      currentUserRole !== UserRole.Owner &&
      currentUserRole !== UserRole.Admin
    ) {
      return {
        redirect: {
          destination: "/" + context.query.organizationSlug,
          permanent: false,
        },
      };
    }
    return {
      props: {},
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
