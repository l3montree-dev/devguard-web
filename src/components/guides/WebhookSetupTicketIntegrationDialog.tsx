import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import React, { FunctionComponent } from "react";
import { Carousel, CarouselApi, CarouselContent } from "../ui/carousel";

import useRepositoryConnection from "../../hooks/useRepositoryConnection";
import { Dialog, DialogContent } from "../ui/dialog";
import ProviderIntegrationSetupSlide from "./webhook-setup-carousel-slides/ProviderIntegrationSetupSlide";
import SelectRepoSlide from "./webhook-setup-carousel-slides/SelectRepoSlide";
import StartSlide from "./webhook-setup-carousel-slides/StartSlide";
import WebhookSetupSlide from "./webhook-setup-carousel-slides/WebhookSetupSlide";

interface WebhookSetupTicketIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WebhookSetupTicketIntegrationDialog: FunctionComponent<
  WebhookSetupTicketIntegrationDialogProps
> = ({ open, onOpenChange }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const asset = useActiveAsset()!;

  const {
    repositories,
    setSelectedProvider,
    selectedProvider,
    isLoadingRepositories,
  } = useRepositoryConnection();
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
              api={api}
              prevIndex={0}
              selectRepoSlideIndex={2}
              webhookSetupSlideIndex={3}
              providerIntegrationSlideIndex={1}
              isLoadingRepositories={isLoadingRepositories}
            />
            <ProviderIntegrationSetupSlide
              api={api}
              provider={selectedProvider}
              selectRepoSlideIndex={2}
              prevIndex={0}
            />
            <SelectRepoSlide
              api={api}
              repositoryName={asset.repositoryName}
              repositoryId={asset.repositoryId}
              repositories={repositories}
              afterSuccessfulConnectionSlideIndex={3}
              prevIndex={1}
            />
            <WebhookSetupSlide
              api={api}
              onOpenChange={onOpenChange}
              prevIndex={2}
            />
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookSetupTicketIntegrationDialog;
