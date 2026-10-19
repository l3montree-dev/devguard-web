// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputWithButton } from "@/components/ui/input-with-button";
import Image from "next/image";
import {
  innerCardClassName,
  innerInputVariant,
  type Surface,
} from "@/lib/surface";
import { useConfig } from "../../../context/ConfigContext";
import useAssetSecrets from "@/hooks/useAssetSecrets";
import type { ExternalTicketProvider } from "@/types/common";

export const webhookInstructions =
  "Go to your GitLab/ openCode project settings and add a webhook with the following URL and secret (“Settings” → “Webhooks”). Ensure that you select the Issue and comment event trigger checkboxes like shown in the screenshot below. You must set a secret token.";

export const jiraWebhookInstructions =
  "In Jira, go to “Settings” → “System” and select “WebHooks” under the “Advanced” section. Click “Create a WebHook” and fill it out with the following URL and secret. Under “Events”, select Issue “updated” and “deleted” and Comment “created”.";

// webhook url + secret, which allow DevGuard to receive ticket updates
export default function WebhookSecretSetup({
  variant,
  provider = "gitlab",
}: {
  // the surface the setup is rendered on
  variant?: Surface;
  provider?: ExternalTicketProvider;
}) {
  const {
    assetSecrets: secrets,
    onGenerateNewSecret: handleGenerateNewSecret,
  } = useAssetSecrets();

  const config = useConfig();

  return (
    <>
      {provider !== "jira" && (
        <Image
          src="/assets/gitlab-webhooks-combined.png"
          alt="GitLab Webhooks"
          className="mb-10 rounded-md w-full h-auto"
          width={1280}
          height={720}
        />
      )}
      <Card className={innerCardClassName(variant)}>
        <CardHeader>
          <CardTitle className="text-lg">Create a new webhook</CardTitle>
          <CardDescription>
            Your issue tracker sends ticket updates to this URL. Click
            &quot;Generate secret&quot;, copy it and paste it as the secret
            token of the webhook. It is only shown once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InputWithButton
            label="Webhook URL"
            nameKey="devguard-webhook-url"
            variant={innerInputVariant(variant)}
            copyable
            copyToastDescription="The webhook URL has been copied to your clipboard."
            value={config.devguardApiUrlPublicInternet + "/api/v1/webhook/"}
          />
          <InputWithButton
            label="Webhook Secret"
            nameKey="devguard-webhook-secret"
            variant={innerInputVariant(variant)}
            copyable
            copyToastDescription="The webhook secret has been copied to your clipboard."
            mutable
            value={secrets?.webhookSecret ?? ""}
            placeholder='Click "Generate secret" to create your secret'
            update={{
              label: "Generate secret",
              update: handleGenerateNewSecret,
              updateConfirmTitle: "Create new webhook secret",
              updateConfirmDescription:
                "Are you sure you want to create a new webhook secret? An existing webhook stops working until you update its secret.",
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
