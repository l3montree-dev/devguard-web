// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useUpdateAsset } from "@/context/AssetContext";
import { useApiQuery } from "@/hooks/useApiQuery";
import { toast } from "@/lib/toast";
import { patchAsset } from "@/services/assetService";
import type { AssetDetailsWithSecretsDTO } from "@/types/dto";
import { generateNewSecret } from "@/utils/view";
import { useAssetScope } from "./useAssetScope";

export default function useAssetSecrets() {
  const scope = useAssetScope();
  const updateAsset = useUpdateAsset();

  const { data: secrets, mutate } = useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/secrets/",
    { params: { path: scope } },
  );

  const handleGenerateNewSecret = async () => {
    const webhookSecret = generateNewSecret();
    try {
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
      toast.success("New webhook secret generated");
    } catch {
      toast.error("Could not generate new secret");
    }
  };

  return {
    assetSecrets: secrets,
    onGenerateNewSecret: handleGenerateNewSecret,
  };
}
