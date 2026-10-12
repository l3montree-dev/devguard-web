// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import GithubAppInstallationAlert from "@/components/common/GithubAppInstallationAlert";
import { GitLabIntegrationDialog } from "@/components/common/GitLabIntegrationDialog";
import { JiraIntegrationDialog } from "@/components/common/JiraIntegrationDialog";
import ListItem from "@/components/common/ListItem";
import { AsyncButton, Button, buttonVariants } from "@/components/ui/button";
import { useConfig } from "@/context/ConfigContext";
import { usePatchOrgContext } from "@/hooks/usePatchOrgContext";
import { cn } from "@/lib/utils";
import { encodeObjectBase64 } from "@/services/encodeService";
import {
  deleteGitlabIntegration,
  deleteJiraIntegration,
} from "@/services/organizationService";
import type { GitLabIntegrationDTO, JiraIntegrationDTO } from "@/types/dto";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ProviderTitle = ({
  src,
  invert,
  children,
}: {
  src: string;
  invert?: boolean;
  children: ReactNode;
}) => (
  <div className="flex flex-row items-center">
    <Image
      src={src}
      alt=""
      width={20}
      height={20}
      className={cn("mr-2 inline-block", invert && "dark:invert")}
    />
    {children}
  </div>
);

const OrgIntegrationsSettings = () => {
  const [org, patchOrg] = usePatchOrgContext();
  const config = useConfig();
  const pathname = usePathname();

  const handleDeleteGitLab = async (id: string) => {
    await deleteGitlabIntegration(org.slug, id);
    patchOrg({
      gitLabIntegrations: org.gitLabIntegrations.filter((i) => i.id !== id),
    });
  };

  const handleDeleteJira = async (id: string) => {
    await deleteJiraIntegration(org.slug, id);
    patchOrg({
      jiraIntegrations: org.jiraIntegrations.filter((i) => i.id !== id),
    });
  };

  const handleNewGitLab = (integration: GitLabIntegrationDTO) =>
    patchOrg({
      gitLabIntegrations: org.gitLabIntegrations.concat(integration),
    });

  const handleNewJira = (integration: JiraIntegrationDTO) =>
    patchOrg({ jiraIntegrations: org.jiraIntegrations.concat(integration) });

  return (
    <>
      {org.githubAppInstallations?.map((installation) => (
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
          Description="DevGuard uses a GitHub App to access your repositories and interact with your code."
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
      {org.gitLabIntegrations.map((integration) => (
        <ListItem
          key={integration.id}
          Title={
            <ProviderTitle src="/assets/gitlab.svg">
              {integration.name}
            </ProviderTitle>
          }
          Description="DevGuard uses an Access-Token to access your repositories and interact with your code."
          Button={
            <AsyncButton
              variant="destructiveOutline"
              onClick={() => handleDeleteGitLab(integration.id)}
            >
              Delete
            </AsyncButton>
          }
        />
      ))}
      {org.jiraIntegrations.map((integration) => (
        <ListItem
          key={integration.id}
          Title={
            <ProviderTitle src="/assets/jira-svgrepo-com.svg">
              {integration.name}
            </ProviderTitle>
          }
          Description="DevGuard uses an Access-Token to access your repositories and create issues."
          Button={
            <AsyncButton
              variant="destructiveOutline"
              onClick={() => handleDeleteJira(integration.id)}
            >
              Delete
            </AsyncButton>
          }
        />
      ))}
      <ListItem
        Title={
          <ProviderTitle src="/assets/github.svg" invert>
            Add a GitHub App
          </ProviderTitle>
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
                    orgSlug: org.slug,
                    redirectTo: pathname || "/",
                  })
                }
              >
                Install GitHub App
              </a>
            }
          >
            <Button variant="secondary">Install GitHub App</Button>
          </GithubAppInstallationAlert>
        }
      />
      <ListItem
        Title={
          <ProviderTitle src="/assets/gitlab.svg">
            Integrate with GitLab
          </ProviderTitle>
        }
        Description="DevGuard uses a personal, organization, group or repository access token to access your repositories and interact with your code. Due to the excessive permissions granted to the app, it can only be done by the organization owner."
        Button={
          <GitLabIntegrationDialog
            onNewIntegration={handleNewGitLab}
            Button={<Button variant="secondary">Integrate with GitLab</Button>}
          />
        }
      />
      <ListItem
        Title={
          <ProviderTitle src="/assets/jira-svgrepo-com.svg">
            Integrate with Jira
          </ProviderTitle>
        }
        Description="DevGuard uses a Jira API Token to access your Jira projects and interact with your issues. This allows DevGuard to create and manage issues in your Jira projects."
        Button={
          <JiraIntegrationDialog
            onNewIntegration={handleNewJira}
            Button={<Button variant="secondary">Integrate with Jira</Button>}
          />
        }
      />
    </>
  );
};

export default OrgIntegrationsSettings;
