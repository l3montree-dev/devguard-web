import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Carousel, CarouselApi, CarouselContent } from "../ui/carousel";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";

import { Dialog, DialogContent } from "../ui/dialog";
import StartSlide from "./webhook-setup-carousel-slides/StartSlide";
import { ExternalTicketProvider } from "@/types/common";
import ProviderIntegrationSetupSlide from "./webhook-setup-carousel-slides/ProviderIntegrationSetupSlide";
import WebhookSetupSlide from "./webhook-setup-carousel-slides/WebhookSetupSlide";
import SelectRepoSlide from "./webhook-setup-carousel-slides/SelectRepoSlide";
import { browserApiClient } from "@/services/devGuardApi";
import { convertRepos } from "@/hooks/useRepositorySearch";
import { toast } from "sonner";

interface WebhookSetupTicketIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WebhookSetupTicketIntegrationDialog: FunctionComponent<
  WebhookSetupTicketIntegrationDialogProps
> = ({ open, onOpenChange }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const asset = useActiveAsset()!;
  const activeOrg = useActiveOrg();
  const [selectedProvider, setSelectedProvider] =
    useState<ExternalTicketProvider>(
      (asset?.externalEntityProviderId as ExternalTicketProvider) || "gitlab",
    );

  const [repositories, setRepositories] = useState<
    { value: string; label: string }[] | null
  >(null);

  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);

  useEffect(() => {
    const fetchRepositories = async () => {
      setIsLoadingRepositories(true);
      const [repoResp] = await Promise.all([
        browserApiClient(
          "/organizations/" + activeOrg.slug + "/integrations/repositories",
        ),
      ]);
      if (repoResp.ok) {
        const data = await repoResp.json();
        setRepositories(convertRepos(data));
      } else {
        toast.error("Failed to fetch repositories. Please try again.");
      }
      setIsLoadingRepositories(false);
    };
    fetchRepositories();
  }, [
    activeOrg.gitLabIntegrations,
    activeOrg.githubAppInstallations,
    activeOrg.jiraIntegrations,
    activeOrg.slug,
  ]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <Carousel
          opts={{
            containScroll: false,
            watchDrag: false,
          }}
          className="w-full"
          plugins={[AutoHeight(), Fade()]}
          setApi={setApi}
        >
          <CarouselContent>
            <StartSlide
              setSelectedProvider={setSelectedProvider}
              provider={selectedProvider}
              activeOrg={activeOrg}
              api={api}
              isLoadingRepositories={isLoadingRepositories}
            />
            <ProviderIntegrationSetupSlide
              api={api}
              provider={selectedProvider}
            />
            <SelectRepoSlide
              activeOrg={activeOrg}
              api={api}
              repositoryName={asset.repositoryName}
              repositoryId={asset.repositoryId}
              repositories={repositories}
            />
            <WebhookSetupSlide api={api} onOpenChange={onOpenChange} />
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookSetupTicketIntegrationDialog;
