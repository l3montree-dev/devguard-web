// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { InputWithButton } from "@/components/ui/input-with-button";
import { useConfig } from "@/context/ConfigContext";
import { useUpdateAsset } from "@/context/AssetContext";
import { useAssetScope } from "@/hooks/useAssetScope";
import { useAssetSecrets } from "@/hooks/useAssetSecrets";
import { patchAsset } from "@/services/assetService";
import type { AssetDetailsWithSecretsDTO } from "@/types/dto";
import { generateNewSecret } from "@/utils/view";

const WebhookSettings = () => {
  const config = useConfig();
  const scope = useAssetScope();
  const updateAsset = useUpdateAsset();
  const { data: secrets, mutate } = useAssetSecrets(scope);

  const handleGenerateNewSecret = async () => {
    const webhookSecret = generateNewSecret();
    await mutate(
      async () => {
        const asset = (await patchAsset(scope, {
          webhookSecret,
        })) as AssetDetailsWithSecretsDTO;
        updateAsset(asset);
        return { webhookSecret: asset.webhookSecret };
      },
      { optimisticData: { webhookSecret }, revalidate: false },
    );
  };

  return (
    <div className="space-y-2 rounded-xl border bg-card px-6 pb-6 pt-4">
      <InputWithButton
        label="Webhook URL"
        value={`${config.devguardApiUrlPublicInternet}/api/v1/webhook/`}
        nameKey="settings-webhook-url"
        message="You can use the URL to send webhook requests to this endpoint."
        variant="onCard"
        copyable
        copyToastDescription="The webhook URL has been copied to your clipboard."
      />
      <InputWithButton
        label="Webhook Secret"
        value={secrets?.webhookSecret ?? "No webhook secret set"}
        nameKey="settings-webhook-secret"
        message="This secret is used to authenticate the webhook requests. You need to set this secret in your webhook configuration."
        variant="onCard"
        copyable
        copyToastDescription="The webhook secret has been copied to your clipboard."
        update={{
          update: handleGenerateNewSecret,
          updateConfirmTitle: "Are you sure to generate a new webhook secret?",
          updateConfirmDescription:
            "This will generate a new webhook secret. All existing webhook configurations will need to be updated with the new secret.",
        }}
      />
    </div>
  );
};

export default WebhookSettings;
