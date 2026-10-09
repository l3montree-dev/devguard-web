// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useRouter } from "next/navigation";
import { useUpdateAsset } from "@/context/AssetContext";
import { toast } from "@/lib/toast";
import { patchAsset } from "@/services/assetService";
import type { components } from "@/types/api/generated";
import type { AssetFormValues } from "@/types/view/asset";
import { useActiveAsset } from "./useActiveAsset";
import { useAssetScope } from "./useAssetScope";

export const useAssetUpdate = () => {
  const asset = useActiveAsset()!;
  const scope = useAssetScope();
  const updateAsset = useUpdateAsset();
  const router = useRouter();

  return async (data: Partial<AssetFormValues>) => {
    const newAsset = await patchAsset(scope, {
      ...data,
      cvssAutomaticTicketThreshold: data.cvssAutomaticTicketThreshold?.[0],
      riskAutomaticTicketThreshold: data.riskAutomaticTicketThreshold?.[0],
      vulnAutoReopenAfterDays:
        "vulnAutoReopenAfterDays" in data
          ? data.vulnAutoReopenAfterDays
            ? +data.vulnAutoReopenAfterDays
            : -1
          : undefined,
    } as Partial<components["schemas"]["dtos.AssetPatchRequest"]>);
    updateAsset(newAsset);
    if (newAsset.slug !== asset.slug) {
      router.push(
        `/${scope.organization}/projects/${scope.projectSlug}/assets/${newAsset.slug}/settings`,
      );
    }
    toast("Success", { description: "Asset updated" });
  };
};
