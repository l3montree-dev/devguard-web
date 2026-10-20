// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { externalProviderIdToIntegrationName } from "@/utils/externalProvider";
import WebhookSecretSetup, { webhookInstructions } from "./WebhookSecretSetup";

interface WebhookSetupSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  onOpenChange: (open: boolean) => void;
  prevIndex: number;
}

export default function WebhookSetupSlide({
  api,
  onOpenChange,
  prevIndex,
}: WebhookSetupSlideProps) {
  const asset = useActiveAsset();

  const isExternalEntityProvider =
    asset?.externalEntityProviderId &&
    // Integration for openCode and GitLab are the same
    externalProviderIdToIntegrationName(asset.externalEntityProviderId) ===
      "gitlab";

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Set Webhook to allow DevGuard to recieve ticket updates
        </DialogTitle>
        <DialogDescription>{webhookInstructions}</DialogDescription>
      </DialogHeader>
      <div className="mt-10">
        <WebhookSecretSetup />
      </div>
      <div className="flex mt-10 flex-row gap-2 justify-end">
        <Button
          variant={"secondary"}
          onClick={() =>
            isExternalEntityProvider
              ? api?.scrollTo(0)
              : api?.scrollTo(prevIndex)
          }
        >
          Back
        </Button>
        <Button
          onClick={() => onOpenChange(false)}
          disabled={!asset?.webhookSecret}
        >
          Finish!
        </Button>
      </div>
    </CarouselItem>
  );
}
