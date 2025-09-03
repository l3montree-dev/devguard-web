// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { middleware } from "@/decorators/middleware";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent, use, useEffect, useState } from "react";
import Page from "../../components/Page";
import { withOrgs } from "../../decorators/withOrgs";
import { withSession } from "../../decorators/withSession";
import { useActiveOrg } from "../../hooks/useActiveOrg";

import GithubAppInstallationAlert from "@/components/common/GithubAppInstallationAlert";
import ListItem from "@/components/common/ListItem";
import Section from "@/components/common/Section";
import { AsyncButton, Button, buttonVariants } from "@/components/ui/button";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { cn } from "@/lib/utils";
import { encodeObjectBase64 } from "@/services/encodeService";

import { OrgForm } from "@/components/OrgForm";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { withOrganization } from "@/decorators/withOrganization";
import { browserApiClient } from "@/services/devGuardApi";
import {
  GitLabIntegrationDTO,
  JiraIntegrationDTO,
  OrganizationDetailsDTO,
  UserRole,
  WebhookDTO,
} from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { withContentTree } from "@/decorators/withContentTree";
import MembersTable from "@/components/MembersTable";
import MemberDialog from "@/components/MemberDialog";
import { GitLabIntegrationDialog } from "@/components/common/GitLabIntegrationDialog";
import DangerZone from "@/components/common/DangerZone";
import { Switch } from "@/components/ui/switch";
import { JiraIntegrationDialog } from "@/components/common/JiraIntegrationDialog";
import { WebhookIntegrationDialog } from "@/components/common/WebhookIntegrationDialog";
import { getCurrentUserRole } from "../../hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { config } from "@/config";
import { string } from "zod";

interface HomeProps {
  devguardGithubAppUrl: string;
}

const Home = ({ devguardGithubAppUrl }: HomeProps) => {
  const activeOrg = useActiveOrg();
  const orgMenu = useOrganizationMenu();
  const updateOrganization = useStore((s) => s.updateOrganization);
  const router = useRouter();
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  const form = useForm<OrganizationDetailsDTO>({
    defaultValues: activeOrg,
  });

  const handleUpdate = async (data: Partial<OrganizationDetailsDTO>) => {
    const resp = await browserApiClient("/organizations/" + activeOrg.slug, {
      method: "PATCH",
      body: JSON.stringify({
        ...data,
        numberOfEmployees: !!data.numberOfEmployees
          ? Number(data.numberOfEmployees)
          : undefined,
      }),
    });

    if (!resp.ok) {
      console.error("Failed to update organization");
    } else if (resp.ok) {
      toast("Success", {
        description: "Organization updated",
      });

      const newOrg = await resp.json();
      updateOrganization(newOrg);

      if (newOrg.slug !== activeOrg.slug) {
        router.push("/" + newOrg.slug + "/settings");
      }
    }
  };

  const handleNewGitLabIntegration = (integration: GitLabIntegrationDTO) => {
    updateOrganization({
      ...activeOrg,
      gitLabIntegrations: activeOrg.gitLabIntegrations.concat(integration),
    });
  };

  const handleNewJiraIntegration = (integration: JiraIntegrationDTO) => {
    updateOrganization({
      ...activeOrg,
      jiraIntegrations: activeOrg.jiraIntegrations.concat(integration),
    });
  };

  const handleNewWebhookIntegration = (integration: WebhookDTO) => {
    updateOrganization({
      ...activeOrg,
      webhooks: activeOrg.webhooks.concat(integration),
    });
  };

  const handleUpdateWebhookIntegration = (integration: WebhookDTO) => {
    updateOrganization({
      ...activeOrg,
      webhooks: activeOrg.webhooks.map((w) =>
        w.id === integration.id ? integration : w,
      ),
    });
  };

  const handleChangeMemberRole = async (
    id: string,
    role: UserRole.Admin | UserRole.Member,
  ) => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/members/" + id,
      {
        method: "PUT",
        body: JSON.stringify({ role }),
      },
    );

    if (resp.ok) {
      updateOrganization({
        ...activeOrg,
        members: activeOrg.members.map((m) =>
          m.id === id ? { ...m, role } : m,
        ),
      });
    } else {
      toast.error("Failed to update member role");
    }
  };

  const handleRemoveMember = async (id: string) => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/members/" + id,
      {
        method: "DELETE",
      },
    );

    if (resp.ok) {
      updateOrganization({
        ...activeOrg,
        members: activeOrg.members.filter((m) => m.id !== id),
      });
    } else {
      toast.error("Failed to remove member");
    }
  };

  const handleDeleteGitLabIntegration = async (id: string) => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/integrations/gitlab/" + id,
      {
        method: "DELETE",
      },
    );

    if (resp.ok) {
      updateOrganization({
        ...activeOrg,
        gitLabIntegrations: activeOrg.gitLabIntegrations.filter(
          (i) => i.id !== id,
        ),
      });
    }
  };

  const handleDeleteJiraIntegration = async (id: string) => {
    const resp = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/integrations/jira/" + id,
      {
        method: "DELETE",
      },
    );

    if (resp.ok) {
      updateOrganization({
        ...activeOrg,
        jiraIntegrations: activeOrg.jiraIntegrations.filter((i) => i.id !== id),
      });
    }
  };

  const handleDeleteWebhook = async (id?: string) => {
    if (!id) return;
    const res = await browserApiClient(
      "/organizations/" + activeOrg.slug + "/integrations/webhook/" + id,
      {
        method: "DELETE",
      },
    );
    if (res.ok) {
      toast.success("Webhook deleted successfully");
      updateOrganization({
        ...activeOrg,
        webhooks: activeOrg.webhooks.filter((w) => w.id !== id),
      });
    } else {
      toast.error("Failed to delete webhook");
    }
  };

  return (
    <Page Title={null} title={""} Menu={orgMenu}>
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Organization Settings</h1>
      </div>
      <div>
        <Section
          description={
            "Manage any third party integrations. You can connect the organization with a GitHub App Installation, a JIRA Project any many more."
          }
          title="Third-Party Integrations"
        >
          {activeOrg.githubAppInstallations?.map((installation) => (
            <ListItem
              key={installation.installationId}
              Title={
                <>
                  <img
                    alt={installation.targetLogin}
                    src={installation.targetAvatarUrl}
                    className="mr-2 inline-block h-6 w-6 rounded-full"
                  />
                  {installation.targetLogin}
                </>
              }
              Description={
                "DevGuard uses a GitHub App to access your repositories and interact with your code."
              }
              Button={
                <Link
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "!text-secondary-foreground hover:no-underline",
                  )}
                  href={installation.settingsUrl}
                >
                  Manage GitHub App
                </Link>
              }
            />
          ))}
          {activeOrg.gitLabIntegrations.map((integration) => (
            <ListItem
              key={integration.id}
              Title={
                <>
                  <div className="flex flex-row items-center">
                    <Image
                      src="/assets/gitlab.svg"
                      alt="GitHub"
                      width={20}
                      height={20}
                      className="mr-2 inline-block"
                    />
                    {integration.name}
                  </div>
                </>
              }
              Description={
                "DevGuard uses an Access-Token to access your repositories and interact with your code."
              }
              Button={
                <AsyncButton
                  variant={"destructiveOutline"}
                  onClick={() => handleDeleteGitLabIntegration(integration.id)}
                >
                  Delete
                </AsyncButton>
              }
            />
          ))}
          {activeOrg.jiraIntegrations.map((integration) => (
            <ListItem
              key={integration.id}
              Title={
                <>
                  <div className="flex flex-row items-center">
                    <Image
                      src="/assets/jira-svgrepo-com.svg"
                      alt="Jira"
                      width={20}
                      height={20}
                      className="mr-2 inline-block"
                    />
                    {integration.name}
                  </div>
                </>
              }
              Description={
                "DevGuard uses an Access-Token to access your repositories and create issues."
              }
              Button={
                <AsyncButton
                  variant={"destructiveOutline"}
                  onClick={() => handleDeleteJiraIntegration(integration.id)}
                >
                  Delete
                </AsyncButton>
              }
            />
          ))}
          <hr />
          <ListItem
            Title={
              <div className="flex flex-row items-center">
                <Image
                  src="/assets/github.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="mr-2 inline-block dark:invert"
                />
                Add a GitHub App
              </div>
            }
            Description="DevGuard uses a GitHub App to access your repositories and interact with your code."
            Button={
              <GithubAppInstallationAlert
                Button={
                  <Link
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "!text-black hover:no-underline",
                    )}
                    href={
                      `https://github.com/apps/${devguardGithubAppUrl}/installations/new?state=` +
                      encodeObjectBase64({
                        orgSlug: activeOrg.slug,
                        redirectTo: router.asPath,
                      })
                    }
                  >
                    Install GitHub App
                  </Link>
                }
              >
                <Button variant={"secondary"}>Install GitHub App</Button>
              </GithubAppInstallationAlert>
            }
          />
          <ListItem
            Title={
              <div className="flex flex-row items-center">
                <Image
                  src="/assets/gitlab.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="mr-2 inline-block"
                />
                Integrate with GitLab
              </div>
            }
            Description="DevGuard uses a personal, group or project access token to access your repositories and interact with your code. Due to the excessive permissions granted to the app, it can only be done by the organization owner."
            Button={
              <GitLabIntegrationDialog
                onNewIntegration={handleNewGitLabIntegration}
                Button={
                  <Button variant={"secondary"}>Integrate with GitLab</Button>
                }
              ></GitLabIntegrationDialog>
            }
          />
          <ListItem
            Title={
              <div className="flex flex-row items-center">
                <Image
                  src="/assets/jira-svgrepo-com.svg"
                  alt="GitHub"
                  width={18}
                  height={18}
                  className="mr-2 inline-block"
                />
                Integrate with Jira
              </div>
            }
            Description="DevGuard uses a Jira API Token to access your Jira projects and interact with your issues. This allows DevGuard to create and manage issues in your Jira projects."
            Button={
              <JiraIntegrationDialog
                onNewIntegration={handleNewJiraIntegration}
                Button={
                  <Button variant={"secondary"}>Integrate with Jira</Button>
                }
              ></JiraIntegrationDialog>
            }
          />
        </Section>
      </div>
      <hr />
      <div>
        <Section
          description={
            "Manage the webhooks that are used to connect DevGuard with your Applications."
          }
          title="Webhooks"
        >
          {activeOrg.webhooks?.map((installation) => (
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
                  projectWebhook={false}
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
                projectWebhook={false}
              />
            }
          />
        </Section>
      </div>
      <hr />
      <Section
        title="Member"
        description="Manage the members of your organization"
      >
        <MembersTable
          onChangeMemberRole={handleChangeMemberRole}
          onRemoveMember={handleRemoveMember}
          members={activeOrg.members}
        />
        <MemberDialog
          isOpen={memberDialogOpen}
          onOpenChange={setMemberDialogOpen}
        />
        <div className="flex flex-row justify-end">
          <Button onClick={() => setMemberDialogOpen(true)}>Add Member</Button>
        </div>
      </Section>
      <hr />
      <div className="pb-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <OrgForm forceVertical={false} />
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </div>
      <hr />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleUpdate)}>
          <Section
            title="Visibility"
            description="Control the visibility of your organization and its projects. If a Organization is public, only the projects that are public will be visible to the public. Private projects are only visible to members of the organization."
          >
            <DangerZone displayTitle={false}>
              <FormField
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <ListItem
                      Description={
                        "Setting this to true will make the organization visible to the public. It allows creating public and private projects."
                      }
                      Title="Public Organization"
                      Button={
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-6 flex items-center justify-end gap-x-6">
                <Button variant="destructive" type="submit">
                  Save
                </Button>
              </div>
            </DangerZone>
          </Section>
        </form>
      </Form>
      <hr />
      <Section
        id="request-org-deletion"
        title="Request Organization Deletion"
        description="If you want to delete your organization, please click the button below and send a request to our support team to delete your organization."
      >
        <Card className="p-6">
          <div className="flex justify-end">
            <Link
              href={
                "mailto:community@devguard.org?subject=Request%20DevGuard%20Organization%20Deletion&body=Hello%2C%20%0A%0AI%20would%20like%20request%20to%20delete%20my%20Organization%20in%20DevGuard.%20%0A%0AID" +
                "=" +
                activeOrg.id +
                "%0AName%3D" +
                activeOrg.name +
                "%20%0A%0AThank%20you."
              }
            >
              <Button variant="destructive">
                Request Organization Deletion
              </Button>
            </Link>
          </div>
        </Card>
      </Section>
    </Page>
  );
};

export default Home;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { organization, session }) => {
    if (organization && "oauth2Error" in organization) {
      return {
        props: {},
      };
    }
    const currentUserRole = getCurrentUserRole(
      session?.identity,
      organization as OrganizationDetailsDTO,
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

    const api = config.devGuardApiUrl;
    let devguardGithubAppUrl = "";
    if (typeof api === "string" && api.includes("main")) {
      devguardGithubAppUrl = "devguard-bot-dev";
    } else if (typeof api === "string" && api.includes("app")) {
      devguardGithubAppUrl = "devguard-bot";
    }

    return {
      props: {
        devguardGithubAppUrl,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    contentTree: withContentTree,
  },
);
