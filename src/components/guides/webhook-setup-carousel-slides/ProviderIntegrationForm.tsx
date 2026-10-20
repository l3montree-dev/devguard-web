// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import GitLabIntegrationForm from "@/components/common/GitLabIntegrationForm";
import JiraIntegrationForm from "@/components/common/JiraIntegrationForm";
import { Button, buttonVariants } from "@/components/ui/button";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { cn } from "@/lib/utils";
import { encodeObjectBase64 } from "@/services/encodeService";
import type { GitLabIntegrationDTO, JiraIntegrationDTO } from "@/types/dto";

import type { ExternalTicketProvider } from "@/types/common";
import type { Surface } from "@/lib/surface";
import Image from "next/image";
import Link from "next/link";
import { useUpdateOrganization } from "../../../context/OrganizationContext";
import useDecodedPathname from "../../../hooks/useDecodedPathname";

interface ProviderIntegrationFormProps {
  provider: ExternalTicketProvider;
  // called once the integration is created
  onConnected?: () => void;
  // renders a back button if set
  onBack?: () => void;
  // the surface the form is rendered on
  variant?: Surface;
}

// form to create a GitLab/ Jira integration or to install the GitHub App
export default function ProviderIntegrationForm({
  provider,
  onConnected,
  onBack,
  variant,
}: ProviderIntegrationFormProps) {
  const activeOrg = useActiveOrg();
  const updateOrganization = useUpdateOrganization();

  const handleNewGitLabIntegration = (integration: GitLabIntegrationDTO) => {
    updateOrganization((prev) => ({
      ...prev,
      organization: {
        ...activeOrg,
        gitLabIntegrations: activeOrg.gitLabIntegrations.concat(integration),
      },
    }));
  };

  const handleNewJiraIntegration = (integration: JiraIntegrationDTO) => {
    updateOrganization((prev) => ({
      ...prev,
      organization: {
        ...activeOrg,
        jiraIntegrations: activeOrg.jiraIntegrations.concat(integration),
      },
    }));
  };

  const pathname = useDecodedPathname();

  return (
    <>
      {(provider === "gitlab" || provider === "opencode") && (
        <GitLabIntegrationForm
          onNewIntegration={handleNewGitLabIntegration}
          additionalOnClick={onConnected}
          variant={variant}
          backButtonClick={onBack}
        />
      )}
      {provider === "github" && (
        <div>
          <p className="text-sm text-muted-foreground">
            Install the DevGuard GitHub App to allow DevGuard to create tickets
            in your GitHub repository. The GitHub App will be available to the
            whole organization. This means that all repositories and users in
            the organization will be able to use the app.
          </p>
          <Link
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "hover:no-underline mt-6",
            )}
            href={
              "https://github.com/apps/devguard-bot/installations/new?state=" +
              encodeObjectBase64({
                orgSlug: activeOrg.slug,
                redirectTo: pathname,
              })
            }
            target="_blank"
          >
            <Image
              src="/assets/provider-icons/github.svg"
              alt="GitHub Icon"
              className="h-5 mr-2 w-5 dark:invert"
              width={20}
              height={20}
            />
            Install GitHub App
          </Link>
          {onBack && onConnected && (
            <div className="flex flex-row gap-4 justify-end mt-4">
              <Button variant={"secondary"} onClick={onBack}>
                Back
              </Button>
              <Button onClick={onConnected}>Next step</Button>
            </div>
          )}
        </div>
      )}
      {provider === "jira" && (
        <JiraIntegrationForm
          onNewIntegration={handleNewJiraIntegration}
          additionalOnClick={onConnected}
          variant={variant}
          backButtonClick={onBack}
        />
      )}
    </>
  );
}
