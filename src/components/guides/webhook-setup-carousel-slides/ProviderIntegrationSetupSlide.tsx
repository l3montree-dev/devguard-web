import GitLabIntegrationForm from "@/components/common/GitLabIntegrationForm";
import JiraIntegrationForm from "@/components/common/JiraIntegrationForm";
import { Button, buttonVariants } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { cn } from "@/lib/utils";
import { encodeObjectBase64 } from "@/services/encodeService";
import { GitLabIntegrationDTO, JiraIntegrationDTO } from "@/types/api/api";
import { ExternalTicketProvider } from "@/types/common";
import { useStore } from "@/zustand/globalStoreProvider";
import Link from "next/link";
import { useRouter } from "next/router";

export interface ProviderIntegrationSetupSlideProps {
  api?: {
    scrollNext: () => void;
    scrollPrev: () => void;
  };
  provider: ExternalTicketProvider;
}

export default function ProviderIntegrationSetupSlide({
  api,
  provider,
}: ProviderIntegrationSetupSlideProps) {
  const activeOrg = useActiveOrg();
  const updateOrganization = useStore((s) => s.updateOrganization);

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

  const providerToBeautifulName: {
    [key in ExternalTicketProvider]: string;
  } = {
    github: "GitHub",
    gitlab: "GitLab",
    jira: "Jira",
    opencode: "openCode",
  };

  const router = useRouter();

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Connect with {providerToBeautifulName[provider]} to allow DevGuard to
          create tickets
        </DialogTitle>
        <hr className="my-4" />
      </DialogHeader>
      <div className="p-1">
        {(provider === "gitlab" || provider === "opencode") && (
          <GitLabIntegrationForm
            onNewIntegration={handleNewGitLabIntegration}
            additionalOnClick={api?.scrollNext}
            backButtonClick={api?.scrollPrev}
          />
        )}
        {provider === "github" && (
          <div>
            <p className="text-sm text-muted-foreground">
              Install the DevGuard GitHub App to allow DevGuard to create
              tickets in your GitHub repository. The GitHub App will be
              available to the whole organization. This means that all
              repositories and users in the organization will be able to use the
              app.
            </p>
            <Link
              className={cn(
                buttonVariants({ variant: "default" }),
                "!text-black hover:no-underline mt-6",
              )}
              href={
                "https://github.com/apps/devguard-bot/installations/new?state=" +
                encodeObjectBase64({
                  orgSlug: activeOrg.slug,
                  redirectTo: router.asPath,
                })
              }
              target="_blank"
            >
              Install GitHub App
            </Link>
            <div className="flex flex-row gap-4 justify-end mt-4">
              <Button variant={"secondary"} onClick={() => api?.scrollPrev()}>
                Back
              </Button>
              <Button onClick={() => api?.scrollNext()}>Next step</Button>
            </div>
          </div>
        )}
        {provider === "jira" && (
          <JiraIntegrationForm
            onNewIntegration={handleNewJiraIntegration}
            additionalOnClick={api?.scrollNext}
            backButtonClick={api?.scrollPrev}
          />
        )}
      </div>
    </CarouselItem>
  );
}
