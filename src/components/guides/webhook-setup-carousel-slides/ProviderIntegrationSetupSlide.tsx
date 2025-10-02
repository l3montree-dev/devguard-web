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
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUpdateOrganization } from "../../../context/OrganizationContext";
import useDecodedPathname from "../../../hooks/useDecodedPathname";

export interface ProviderIntegrationSetupSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  provider: ExternalTicketProvider;
  prevIndex: number;
  selectRepoSlideIndex: number;
}

export default function ProviderIntegrationSetupSlide({
  api,
  provider,
  selectRepoSlideIndex,
  prevIndex,
}: ProviderIntegrationSetupSlideProps) {
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

  const providerToBeautifulName: {
    [key in ExternalTicketProvider]: string;
  } = {
    github: "GitHub",
    gitlab: "GitLab",
    jira: "Jira",
    opencode: "openCode",
  };

  const pathname = useDecodedPathname();
  const router = useRouter();

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Connect with {providerToBeautifulName[provider]} to allow DevGuard to
          create tickets
        </DialogTitle>
      </DialogHeader>
      <div className="mt-10 px-1">
        {(provider === "gitlab" || provider === "opencode") && (
          <GitLabIntegrationForm
            onNewIntegration={handleNewGitLabIntegration}
            additionalOnClick={() => api?.scrollTo(selectRepoSlideIndex)}
            backButtonClick={() => api?.scrollTo(prevIndex)}
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
            <div className="flex flex-row gap-4 justify-end mt-4">
              <Button
                variant={"secondary"}
                onClick={() => api?.scrollTo(prevIndex)}
              >
                Back
              </Button>
              <Button onClick={() => api?.scrollTo(selectRepoSlideIndex)}>
                Next step
              </Button>
            </div>
          </div>
        )}
        {provider === "jira" && (
          <JiraIntegrationForm
            onNewIntegration={handleNewJiraIntegration}
            additionalOnClick={() => api?.scrollTo(selectRepoSlideIndex)}
            backButtonClick={() => api?.scrollTo(prevIndex)}
          />
        )}
      </div>
    </CarouselItem>
  );
}
