import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import React, { FunctionComponent, useState } from "react";
import { Carousel, CarouselApi, CarouselContent } from "../ui/carousel";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";

import { Dialog, DialogContent } from "../ui/dialog";
import StartSlide from "./webhook-setup-carousel-slides/StartSlide";
import { ExternalTicketProvider } from "@/types/common";
import ProviderIntegrationSetupSlide from "./webhook-setup-carousel-slides/ProviderIntegrationSetupSlide";
import WebhookSetupSlide from "./webhook-setup-carousel-slides/WebhookSetupSlide";
import SelectRepoSlide from "./webhook-setup-carousel-slides/SelectRepoSlide";

interface WebhookSetupTicketIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositories: Array<{ value: string; label: string }> | null;
}

const WebhookSetupTicketIntegrationDialog: FunctionComponent<
  WebhookSetupTicketIntegrationDialogProps
> = ({ open, onOpenChange, repositories }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const asset = useActiveAsset()!;
  const activeOrg = useActiveOrg();
  const [selectedProvider, setSelectedProvider] =
    useState<ExternalTicketProvider>(
      (asset?.externalEntityProviderId as ExternalTicketProvider) || "gitlab",
    );

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
            />
            <ProviderIntegrationSetupSlide
              api={api}
              provider={selectedProvider}
            />
            <SelectRepoSlide
              activeOrg={activeOrg}
              api={api}
              repositories={repositories}
              repositoryName={asset.repositoryName}
              repositoryId={asset.repositoryId}
            />
            <WebhookSetupSlide api={api} onOpenChange={onOpenChange} />
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookSetupTicketIntegrationDialog;
