// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalTicketProviderNames } from "@/const/providers";
import type { ExternalTicketProvider } from "@/types/common";
import ProviderIntegrationForm from "./ProviderIntegrationForm";

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
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Connect with {ExternalTicketProviderNames[provider]} to allow DevGuard
          to create tickets
        </DialogTitle>
      </DialogHeader>
      <div className="mt-10 px-1">
        <ProviderIntegrationForm
          provider={provider}
          onConnected={() => api?.scrollTo(selectRepoSlideIndex)}
          onBack={() => api?.scrollTo(prevIndex)}
        />
      </div>
    </CarouselItem>
  );
}
