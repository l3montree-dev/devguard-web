// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import ProviderTitleIcon from "@/components/common/ProviderTitleIcon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CarouselItem } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalTicketProviderNames } from "@/const/providers";
import type { ExternalTicketProvider } from "@/types/common";
import { InfoIcon } from "lucide-react";
import ProviderSetup from "../ProviderSetup";
import DevGuardBotInvite from "./DevGuardBotInvite";
import { useEffect } from "react";
import { externalProviderIdToIntegrationName } from "@/utils/externalProvider";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { Button } from "@/components/ui/button";
import { useActiveOrg } from "../../../hooks/useActiveOrg";

interface StartSlideProps {
  setSelectedProvider: (provider: ExternalTicketProvider) => void;
  api: CarouselApi;
  provider: ExternalTicketProvider;
  providerIntegrationSlideIndex: number;
  prevIndex: number;
  isLoadingRepositories: boolean;
  webhookSetupSlideIndex: number;
  selectRepoSlideIndex: number;
}

export default function StartSlide({
  setSelectedProvider,
  isLoadingRepositories,
  provider,
  webhookSetupSlideIndex,
  api,
}: StartSlideProps) {
  useEffect(() => {
    api?.reInit();
  }, [provider, api]);

  const asset = useActiveAsset();
  const activeOrg = useActiveOrg();
  const isExternalEntityProvider =
    asset?.externalEntityProviderId &&
    // Integration for openCode and GitLab are the same
    externalProviderIdToIntegrationName(asset.externalEntityProviderId) ===
      "gitlab";

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Let&apos;s get your Tickets in Sync with DevGuard
        </DialogTitle>

        <Alert variant="default" className="mt-4">
          <InfoIcon />
          <AlertTitle>About Ticket Integration</AlertTitle>
          <AlertDescription>
            You can connect your repository at GitLab, openCode or GitHub with
            DevGuard to enable ticket-based risk management. Whenever DevGuard
            detects a new risk in your code, it will automatically create a
            ticket in your issue tracker. In your issue tracker, you can then
            work on the risk and even use slash commands to apply mitigation
            strategies.
          </AlertDescription>
        </Alert>
      </DialogHeader>
      <div className="mt-10 px-1">
        {isExternalEntityProvider ? (
          <div className="">
            <DevGuardBotInvite />
            <div className="mt-10 flex flex-row gap-2 justify-end">
              <Button
                onClick={() => {
                  api?.scrollTo(webhookSetupSlideIndex);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="">
            <h3 className="font-semibold flex items-center">
              Ensure that DevGuard is connected to your issue tracker
            </h3>
            <div className="mt-4">
              <p className="mb-4 text-sm text-muted-foreground">
                First, select your issue tracker from the dropdown menu.
              </p>
              <Select
                value={provider}
                onValueChange={(value) => {
                  setSelectedProvider(value as ExternalTicketProvider);
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ExternalTicketProviderNames).map((provider) => (
                    <SelectItem
                      key={provider}
                      value={provider}
                      onClick={() =>
                        setSelectedProvider(provider as ExternalTicketProvider)
                      }
                    >
                      <ProviderTitleIcon
                        provider={provider as ExternalTicketProvider}
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-6">
              <ProviderSetup
                selectedProvider={provider}
                activeOrg={activeOrg}
                api={api}
                prevIndex={0}
                selectRepoSlideIndex={2}
                providerIntegrationSlideIndex={1}
                isLoadingRepositories={isLoadingRepositories}
              />
            </div>
          </div>
        )}
      </div>
    </CarouselItem>
  );
}
