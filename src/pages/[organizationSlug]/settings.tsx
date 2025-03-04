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
import { FunctionComponent, useState } from "react";
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
import { Form } from "@/components/ui/form";
import { withOrganization } from "@/decorators/withOrganization";
import { browserApiClient } from "@/services/devGuardApi";
import { GitLabIntegrationDTO, OrganizationDetailsDTO } from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { withContentTree } from "@/decorators/withContentTree";
import MembersTable from "@/components/MembersTable";
import MemberDialog from "@/components/MemberDialog";
import GitLabIntegrationDialog from "@/components/common/GitLabIntegrationDialog";

const Home: FunctionComponent = () => {
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

  const handleChangeMemberRole = async (
    id: string,
    role: "admin" | "member",
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

  const handleDelete = async (id: string) => {
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

  return (
    <Page
      Title={
        <Link
          href={`/${activeOrg.slug}/projects`}
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
      }
      title={activeOrg.name ?? "Loading..."}
      Menu={orgMenu}
    >
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
              description={
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
              description={
                "DevGuard uses an Access-Token to access your repositories and interact with your code."
              }
              Button={
                <AsyncButton
                  variant={"destructiveOutline"}
                  onClick={() => handleDelete(integration.id)}
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
            description="DevGuard uses a GitHub App to access your repositories and interact with your code."
            Button={
              <GithubAppInstallationAlert
                Button={
                  <Link
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "!text-black hover:no-underline",
                    )}
                    href={
                      "https://github.com/apps/devguard-app/installations/new?state=" +
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
            description="DevGuard uses a personal, group or project access token to access your repositories and interact with your code. Due to the excessive permissions granted to the app, it can only be done by the organization owner."
            Button={
              <GitLabIntegrationDialog
                onNewIntegration={handleNewGitLabIntegration}
                Button={
                  <Button variant={"secondary"}>Integrate with GitLab</Button>
                }
              ></GitLabIntegrationDialog>
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
      <div className="pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <OrgForm form={form} />
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </div>
    </Page>
  );
};

export default Home;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    contentTree: withContentTree,
  },
);
