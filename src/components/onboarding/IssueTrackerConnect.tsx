// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import ProviderTitleIcon from "@/components/common/ProviderTitleIcon";
import ProviderSetup from "@/components/guides/ProviderSetup";
import DevGuardBotInvite from "@/components/guides/webhook-setup-carousel-slides/DevGuardBotInvite";
import ProviderIntegrationForm from "@/components/guides/webhook-setup-carousel-slides/ProviderIntegrationForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalTicketProviderNames } from "@/const/providers";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import type { ExternalTicketProvider } from "@/types/common";
import type { Surface } from "@/lib/surface";
import { useState } from "react";
import type { FunctionComponent } from "react";

// the content of the start slide of the webhook setup carousel - without the carousel
const IssueTrackerConnect: FunctionComponent<{
  // the surface the step is rendered on
  variant?: Surface;
}> = ({ variant }) => {
  const asset = useActiveAsset();
  const activeOrg = useActiveOrg();
  const [provider, setProvider] = useState<ExternalTicketProvider>(
    (asset?.repositoryProvider as ExternalTicketProvider) || "gitlab",
  );
  const [addAnother, setAddAnother] = useState(false);

  // synced assets (gitlab and opencode - both GitLab instances) only need the bot as project member
  if (asset?.externalEntityProviderId) {
    return <DevGuardBotInvite showTitle={false} variant={variant} />;
  }

  const hasIntegration =
    activeOrg.githubAppInstallations?.length > 0 ||
    activeOrg.gitLabIntegrations?.length > 0 ||
    activeOrg.jiraIntegrations?.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <Select
        value={provider}
        onValueChange={(value) => {
          setProvider(value as ExternalTicketProvider);
        }}
      >
        <SelectTrigger variant={variant} className="w-[220px]">
          <SelectValue placeholder="Select Provider" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(ExternalTicketProviderNames).map((p) => (
            <SelectItem key={p} value={p}>
              <ProviderTitleIcon provider={p as ExternalTicketProvider} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasIntegration && (
        <ProviderSetup
          selectedProvider={provider}
          activeOrg={activeOrg}
          isLoadingRepositories={false}
          prevIndex={0}
          selectRepoSlideIndex={0}
          providerIntegrationSlideIndex={0}
          showNavigation={false}
          variant={variant}
          onAddAnother={() => setAddAnother(true)}
        />
      )}
      {(!hasIntegration || addAnother) && (
        <ProviderIntegrationForm
          provider={provider}
          onConnected={() => setAddAnother(false)}
          variant={variant}
        />
      )}
    </div>
  );
};

export default IssueTrackerConnect;
