// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useState } from "react";
import Page from "../../../../components/Page";
import GithubAppInstallationAlert from "@/components/common/GithubAppInstallationAlert";
import ListItem from "@/components/common/ListItem";
import Section from "@/components/common/Section";
import { AsyncButton, Button, buttonVariants } from "@/components/ui/button";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { cn } from "@/lib/utils";
import { encodeObjectBase64 } from "@/services/encodeService";
import MemberDialog from "@/components/MemberDialog";
import MembersTable from "@/components/MembersTable";
import WebhooksTable from "@/components/WebhooksTable";
import { OrgForm } from "@/components/OrgForm";
import DangerZone from "@/components/common/DangerZone";
import { GitLabIntegrationDialog } from "@/components/common/GitLabIntegrationDialog";
import { JiraIntegrationDialog } from "@/components/common/JiraIntegrationDialog";
import { WebhookIntegrationDialog } from "@/components/common/WebhookIntegrationDialog";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useWebhooks } from "@/hooks/useWebhooks";
import {
  changeOrgMemberRole,
  deleteGitlabIntegration,
  deleteJiraIntegration,
  deleteOrganization,
  patchOrganization,
  removeOrgMember,
  revokeInvitation,
} from "@/services/organizationService";
import { UserRole } from "@/types/view/vuln";
import type {
  GitLabIntegrationDTO,
  JiraIntegrationDTO,
  OrganizationDetailsDTO,
  WebhookDTO,
} from "@/types/dto";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "@/lib/toast";
import { useConfig } from "../../../../context/ConfigContext";
import {
  useOrganization,
  useUpdateOrganization,
} from "../../../../context/OrganizationContext";
import Alert from "../../../../components/common/Alert";
import { useAutoTour } from "@/hooks/useAutoTour";
import { orgSettingsTourSteps } from "@/components/common/tours/orgSettingsTour";
import InvitedMembersTable from "@/components/InvitedMembersTable";
import AccessTokenManagement from "@/components/AccessTokenManagement";
import useDecodedParams from "@/hooks/useDecodedParams";

const Home = () => {
  let { organizationSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
    assetVersionSlug: string;
  };

  const url = "/organizations/" + organizationSlug + "/pats/";

  const orgCtx = useOrganization();
  const activeOrg = orgCtx?.organization as OrganizationDetailsDTO;
  const updateOrgCtx = useUpdateOrganization();
  const orgMenu = useOrganizationMenu();
  const router = useRouter();
  const pathName = usePathname();
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);

  const form = useForm<OrganizationDetailsDTO>({
    defaultValues: activeOrg,
  });

  const handleUpdate = async (data: Partial<OrganizationDetailsDTO>) => {
    let updated;
    try {
      updated = await patchOrganization(activeOrg.slug, {
        ...data,
        numberOfEmployees: !!data.numberOfEmployees
          ? Number(data.numberOfEmployees)
          : undefined,
      });
    } catch {
      toast.error("Could not update organization");
      return false;
    }

    const newOrg = updated as OrganizationDetailsDTO;

    if (newOrg.slug !== activeOrg.slug) {
      toast("Success", {
        description: "Organization updated - redirecting to new page...",
      });

      setTimeout(() => {
        router.push("/" + newOrg.slug + "/settings");
      }, 2000);
    } else {
      toast("Success", {
        description: "Organization updated",
      });
      updateOrgCtx({
        ...orgCtx,
        organization: newOrg,
      });
    }
    return true;
  };

  const handleNewGitLabIntegration = (integration: GitLabIntegrationDTO) => {
    updateOrgCtx({
      ...orgCtx,
      organization: {
        ...activeOrg,
        gitLabIntegrations: activeOrg.gitLabIntegrations.concat(integration),
      },
    });
  };

  const handleNewJiraIntegration = (integration: JiraIntegrationDTO) => {
    updateOrgCtx({
      ...orgCtx,
      organization: {
        ...activeOrg,
        jiraIntegrations: activeOrg.jiraIntegrations.concat(integration),
      },
    });
  };

  const { webhooks, webhooksLoading, mutateWebhooks } = useWebhooks({
    level: "organization",
    organization: organizationSlug,
  });

  const handleNewWebhookIntegration = (integration: WebhookDTO) => {
    mutateWebhooks((prev) => (prev ?? []).concat(integration), {
      revalidate: false,
    });
  };

  const handleUpdateWebhookIntegration = (integration: WebhookDTO) => {
    mutateWebhooks(
      (prev) =>
        (prev ?? []).map((w) => (w.id === integration.id ? integration : w)),
      { revalidate: false },
    );
  };

  const handleWebhookDeleted = (id: string) => {
    mutateWebhooks((prev) => (prev ?? []).filter((w) => w.id !== id), {
      revalidate: false,
    });
  };

  const handleChangeMemberRole = async (
    id: string,
    role: UserRole.Admin | UserRole.Member,
  ) => {
    try {
      await changeOrgMemberRole(activeOrg.slug, id, role);
      updateOrgCtx({
        ...orgCtx,
        organization: {
          ...activeOrg,
          members: activeOrg.members.map((m) =>
            m.id === id ? { ...m, role } : m,
          ),
        },
      });
    } catch {
      toast.error("Failed to update member role");
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeOrgMember(activeOrg.slug, id);
      updateOrgCtx({
        ...orgCtx,
        organization: {
          ...activeOrg,
          members: activeOrg.members.filter((m) => m.id !== id),
        },
      });
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleDeleteGitLabIntegration = async (id: string) => {
    await deleteGitlabIntegration(activeOrg.slug, id);
    updateOrgCtx({
      ...orgCtx,
      organization: {
        ...activeOrg,
        gitLabIntegrations: activeOrg.gitLabIntegrations.filter(
          (i) => i.id !== id,
        ),
      },
    });
  };

  const handleDeleteJiraIntegration = async (id: string) => {
    await deleteJiraIntegration(activeOrg.slug, id);
    updateOrgCtx({
      ...orgCtx,
      organization: {
        ...activeOrg,
        jiraIntegrations: activeOrg.jiraIntegrations.filter((i) => i.id !== id),
      },
    });
  };

  const handleDeleteOrganization = async () => {
    try {
      await deleteOrganization(activeOrg.slug);
      toast.success("Organization deleted successfully");
      // Full navigation instead of router.push so the organization list is
      // refetched — otherwise the stale list redirects back into the
      // just-deleted organization.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a soft push keeps the deleted org in the client cache
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete organization");
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      await revokeInvitation(activeOrg.slug, id);
      updateOrgCtx({
        ...orgCtx,
        organization: {
          ...activeOrg,
          invitedMembers: activeOrg.invitedMembers.filter((m) => m.id !== id),
        },
      });
    } catch {
      toast.error("Failed to revoke invitation");
    }
  };

  useAutoTour("org-settings", orgSettingsTourSteps);

  const config = useConfig();

  return (
    <Page Title={null} title={""} Menu={orgMenu}>
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Organization Settings</h1>
      </div>
      <div data-tour="third-party-integrations">
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
                  <a
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "!text-primary-foreground hover:no-underline",
                    )}
                    href={
                      `https://github.com/apps/${config.devguardGithubAppUrl}/installations/new?state=` +
                      encodeObjectBase64({
                        orgSlug: activeOrg.slug,
                        redirectTo: pathName || "/",
                      })
                    }
                  >
                    Install GitHub App
                  </a>
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
            Description="DevGuard uses a personal, organization, group or repository access token to access your repositories and interact with your code. Due to the excessive permissions granted to the app, it can only be done by the organization owner."
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
      <div data-tour="webhook">
        <Section
          description={
            "Manage the webhooks that are used to connect DevGuard with your Applications."
          }
          title="Webhooks"
        >
          <WebhooksTable
            webhooks={webhooks ?? []}
            scope={{ level: "organization", organization: activeOrg.slug }}
            onUpdateWebhook={handleUpdateWebhookIntegration}
            onDeleted={handleWebhookDeleted}
            projectWebhook={false}
            isLoading={webhooksLoading}
          />
          <div className="flex flex-row justify-end">
            <WebhookIntegrationDialog
              onNewIntegration={handleNewWebhookIntegration}
              Button={<Button>Add Webhook</Button>}
              projectWebhook={false}
            />
          </div>
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
          <Button
            data-testid="add-member-button"
            onClick={() => setMemberDialogOpen(true)}
          >
            Add Member
          </Button>
        </div>
      </Section>
      <Section
        title="Invitations"
        description="Manage pending invitations of your organization"
      >
        <InvitedMembersTable
          members={activeOrg.invitedMembers}
          onRevokeInvitation={handleRevokeInvitation}
        />
      </Section>
      <hr />
      <div className="pb-12">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <OrgForm forceVertical={false} />
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <Button isSubmitting={form.formState.isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
      <hr />
      <div data-tour="config-file">
        <Section
          id="config-files"
          title="Configuration Files"
          description="View and edit configuration files for your organization, including scanner tool settings. These configurations are inherited by all projects and repositories in your organization and can be overridden at the project or repository level."
        >
          <Card className="p-6">
            <div className="flex justify-end">
              <Link href={"/" + activeOrg.slug + "/settings/config"}>
                <Button variant={"outline"}>Go to Configuration Files</Button>
              </Link>
            </div>
          </Card>
        </Section>
      </div>
      <div data-tour="dependency-proxy">
        <Section
          id="dependency-proxy"
          title="Dependency Proxy Settings"
          description="View and edit the settings for the Dependency Proxy, which caches dependencies to speed up builds and reduce load on external package registries."
        >
          <Card className="p-6">
            <div className="flex justify-end">
              <Link href={"/" + activeOrg.slug + "/settings/dependency-proxy"}>
                <Button variant={"outline"}>
                  Go to Dependency Proxy Settings{" "}
                </Button>
              </Link>
            </div>
          </Card>
        </Section>
        <AccessTokenManagement
          url={url}
          section={{
            title: "Generate your Organization Access Tokens",
            description:
              "Manage your organization access tokens that scanners and other integrations use to authenticate with DevGuard.",
          }}
        />
      </div>
      <hr />
      <FormProvider {...form}>
        <div data-tour="visibility">
          <DangerZone>
            <Section
              className="m-2"
              id="request-org-deletion"
              title="Advanced"
              description="These settings are for advanced users only. Please be careful when changing these settings."
            >
              <FormField
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <ListItem
                      Description={
                        "Setting this to true will make the organization visible to the public. Only projects that are public become visible, private projects stay visible to members of the organization only."
                      }
                      Title="Public Organization"
                      Button={
                        <FormControl>
                          <Switch
                            data-testid="public-org-switch"
                            disabled={isSavingVisibility}
                            checked={field.value}
                            onCheckedChange={async (checked) => {
                              field.onChange(checked);
                              setIsSavingVisibility(true);
                              const ok = await handleUpdate({
                                isPublic: checked,
                              });
                              // the save failed, so put the switch back where it was
                              if (!ok) {
                                field.onChange(!checked);
                              }
                              setIsSavingVisibility(false);
                            }}
                          />
                        </FormControl>
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ListItem
                Title="Delete Organization"
                Description={
                  "This will delete the organization including all projects and repositories. This action cannot be undone."
                }
                Button={
                  <Alert
                    title="Are you sure to delete this organization?"
                    description="This action cannot be undone. All data associated with this organization will be deleted."
                    onConfirm={handleDeleteOrganization}
                  >
                    <Button variant="destructive">Delete</Button>
                  </Alert>
                }
              />
            </Section>
          </DangerZone>
        </div>
      </FormProvider>
    </Page>
  );
};

export default Home;
