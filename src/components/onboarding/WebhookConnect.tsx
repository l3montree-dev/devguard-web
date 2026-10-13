// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import ProviderTitleIcon from "@/components/common/ProviderTitleIcon";
import WebhookSecretSetup, {
  jiraWebhookInstructions,
  webhookInstructions,
} from "@/components/guides/webhook-setup-carousel-slides/WebhookSecretSetup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalTicketProviderNames } from "@/const/providers";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import type { Surface } from "@/lib/surface";
import type { ExternalTicketProvider } from "@/types/common";
import { CircleCheck } from "lucide-react";
import { useState } from "react";
import type { FunctionComponent } from "react";

const WebhookConnect: FunctionComponent<{
  variant?: Surface;
}> = ({ variant }) => {
  const asset = useActiveAsset();

  const [provider, setProvider] = useState<ExternalTicketProvider>(
    asset?.externalEntityProviderId
      ? "gitlab"
      : (asset?.repositoryProvider as ExternalTicketProvider) || "gitlab",
  );

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
      {provider === "github" ? (
        <Alert>
          <CircleCheck />
          <AlertTitle>No webhook needed</AlertTitle>
          <AlertDescription>
            The DevGuard GitHub App already receives issue and comment events
            from GitHub. Once the app is installed on your repository, ticket
            updates are synced automatically.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {provider === "jira"
              ? jiraWebhookInstructions
              : webhookInstructions}
          </p>
          <WebhookSecretSetup variant={variant} provider={provider} />
        </>
      )}
    </div>
  );
};

export default WebhookConnect;
