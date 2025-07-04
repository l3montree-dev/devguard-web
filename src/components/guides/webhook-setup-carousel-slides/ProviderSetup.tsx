import { ExternalTicketProvider } from "@/types/common";
import { OrganizationDetailsDTO, OrganizationDTO } from "@/types/api/api";
import Link from "next/link";
import Image from "next/image";
import ListItem from "@/components/common/ListItem";
import { AsyncButton, Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GithubAppInstallationAlert from "@/components/common/GithubAppInstallationAlert";
import { useRouter } from "next/router";
import { encodeObjectBase64 } from "@/services/encodeService";
import { GitLabIntegrationDialog } from "@/components/common/GitLabIntegrationDialog";
import { InfoIcon } from "lucide-react";
import { browserApiClient } from "@/services/devGuardApi";
import { useStore } from "@/zustand/globalStoreProvider";

interface ProviderSetupProps {
  selectedProvider: ExternalTicketProvider;
  activeOrg: OrganizationDetailsDTO;
  api?: {
    scrollNext: () => void;
  };
}

export default function ProviderSetup({
  selectedProvider,
  activeOrg,
  api,
}: ProviderSetupProps) {
  const router = useRouter();
  const updateOrganization = useStore((s) => s.updateOrganization);

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
    <div>
      <p className="mb-4 flex items-center text-sm text-muted-foreground mt-4">
        <InfoIcon className="h-4 w-4 mr-2" />
        {activeOrg.githubAppInstallations?.length > 0 ||
        activeOrg.gitLabIntegrations?.length > 0
          ? "You have already configured some provider(s). You can manage them below."
          : "You have not configured any providers yet. Please connect one."}
      </p>
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
          className="mb-4"
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
              onClick={() => handleDelete(integration.id)}
            >
              Delete
            </AsyncButton>
          }
        />
      ))}
      {selectedProvider === ExternalTicketProvider.GITHUB && (
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
                    "https://github.com/apps/devguard-bot/installations/new?state=" +
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
      )}
      {selectedProvider === ExternalTicketProvider.GITLAB && (
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
            <Button variant={"default"} onClick={() => api?.scrollNext()}>
              Integrate with GitLab
            </Button>
          }
        />
      )}
    </div>
  );
}
