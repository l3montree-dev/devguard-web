import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import React, { FunctionComponent, useState } from "react";
import { Carousel, CarouselApi, CarouselContent } from "../ui/carousel";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";

import { Dialog, DialogContent } from "../ui/dialog";
import StartSlide from "./webhook-setup-carousel-slides/StartSlide";
import { ExternalTicketProvider } from "@/types/common";
import GitLabIntegrationSetupSlide from "./webhook-setup-carousel-slides/GitLabIntegrationSetupSlide";
import WebhookSetupSlide from "./webhook-setup-carousel-slides/WebhookSetupSlide";

interface WebhookSetupTicketIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WebhookSetupTicketIntegrationDialog: FunctionComponent<
  WebhookSetupTicketIntegrationDialogProps
> = ({ open, onOpenChange }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const asset = useActiveAsset();
  const activeOrg = useActiveOrg();
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(
    asset?.externalEntityProviderId || undefined,
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
              selectedProvider={selectedProvider}
              provider={selectedProvider as ExternalTicketProvider}
              activeOrg={activeOrg}
              api={api}
            />
            <GitLabIntegrationSetupSlide api={api} />
            <WebhookSetupSlide api={api} onOpenChange={onOpenChange} />
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookSetupTicketIntegrationDialog;
