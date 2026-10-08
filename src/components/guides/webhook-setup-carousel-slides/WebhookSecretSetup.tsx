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
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { patchAsset } from "@/services/assetService";
import Image from "next/image";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  innerCardClassName,
  innerInputVariant,
  type Surface,
} from "@/lib/surface";
import { useUpdateAsset } from "../../../context/AssetContext";
import { useConfig } from "../../../context/ConfigContext";

export const webhookInstructions =
  "Go to your GitLab/ openCode project settings and add a webhook with the following URL and secret (“Settings” → “Webhooks”). Ensure that you select the Issue and comment event trigger checkboxes like shown in the screenshot below. You must set a secret token.";

// webhook url + secret, which allow DevGuard to receive ticket updates
export default function WebhookSecretSetup({
  variant,
}: {
  // the surface the setup is rendered on
  variant?: Surface;
}) {
  const generateNewSecret = (): string => {
    return crypto.randomUUID();
  };
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const updateAsset = useUpdateAsset();
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  const handleGenerateNewSecret = async () => {
    let r;
    try {
      r = (await patchAsset(
        {
          organization: activeOrg.slug,
          projectSlug: project!.slug,
          assetSlug: asset.slug,
        },
        { webhookSecret: generateNewSecret() } as never,
      )) as { webhookSecret: string };
    } catch {
      r = null;
    }

    if (r) {
      setWebhookSecret(r.webhookSecret);
      updateAsset({ ...asset, webhookSecret: r.webhookSecret });
      navigator.clipboard.writeText(r.webhookSecret);
      toast.success("New webhook secret generated and copied to clipboard");
    } else {
      toast.error("Could not generate new secret");
    }
  };

  const config = useConfig();

  return (
    <>
      <Image
        src="/assets/gitlab-webhooks-combined.png"
        alt="GitLab Webhooks"
        className="rounded-md w-full h-auto"
        width={1280}
        height={720}
      />
      <Card className={cn("mt-10", innerCardClassName(variant))}>
        <CardHeader>
          <CardTitle className="text-lg">Create a new webhook</CardTitle>
          <CardDescription>
            Your issue tracker sends ticket updates to this URL. Create a
            secret, copy it and paste it as the secret token of the webhook. It
            is only shown once.
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
            value={webhookSecret ?? "<WEBHOOK SECRET>"}
            update={{
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
