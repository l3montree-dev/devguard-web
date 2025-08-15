import ListItem from "@/components/common/ListItem";
import { AsyncButton, Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { browserApiClient } from "@/services/devGuardApi";
import { OrganizationDetailsDTO } from "@/types/api/api";
import { ExternalTicketProvider } from "@/types/common";
import { useStore } from "@/zustand/globalStoreProvider";
import { InfoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProviderSetupProps {
  selectedProvider: ExternalTicketProvider;
  activeOrg: OrganizationDetailsDTO;
  api?: {
    scrollTo: (index: number) => void;
  };
  isLoadingRepositories: boolean;
  selectRepoSlideIndex: number;
  providerIntegrationSlideIndex: number;
}

export default function ProviderSetup({
  selectedProvider,
  activeOrg,
  api,
  providerIntegrationSlideIndex,
  selectRepoSlideIndex,
  isLoadingRepositories,
}: ProviderSetupProps) {
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

  const providerIntegrationPresent =
    activeOrg.githubAppInstallations?.length > 0 ||
    activeOrg.gitLabIntegrations?.length > 0;

  return (
    <div>
      <p className="mb-4 flex items-center text-sm text-muted-foreground mt-4">
        <InfoIcon className="h-4 w-4 mr-2" />
        {providerIntegrationPresent
          ? "You have already configured some provider(s). You can manage them below."
          : "You have not configured any providers yet. Please connect one by continuing the setup flow."}
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
      {providerIntegrationPresent && (
        <div className="mb-4 flex flex-col items-end">
          <Button
            onClick={() => api?.scrollTo(providerIntegrationSlideIndex)}
            variant={"secondary"}
          >
            Add another{" "}
            {selectedProvider === "github"
              ? "GitHub App"
              : "GitLab Integration"}
          </Button>
        </div>
      )}
      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button
          disabled={selectedProvider === undefined || isLoadingRepositories}
          onClick={() => {
            providerIntegrationPresent
              ? api?.scrollTo(selectRepoSlideIndex)
              : api?.scrollTo(providerIntegrationSlideIndex);
          }}
        >
          {isLoadingRepositories ? "Loading Repositories..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
