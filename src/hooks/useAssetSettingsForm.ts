// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useForm } from "react-hook-form";
import type { AssetFormValues } from "@/types/view/asset";
import { isNumber } from "@/utils/common";
import { useActiveAsset } from "./useActiveAsset";

export const useAssetSettingsForm = () => {
  const asset = useActiveAsset()!;

  return useForm<AssetFormValues>({
    defaultValues: {
      ...asset,
      vulnAutoReopenAfterDays: asset.vulnAutoReopenAfterDays ?? -1,
      cvssAutomaticTicketThreshold: isNumber(asset.cvssAutomaticTicketThreshold)
        ? [asset.cvssAutomaticTicketThreshold]
        : [],
      riskAutomaticTicketThreshold: isNumber(asset.riskAutomaticTicketThreshold)
        ? [asset.riskAutomaticTicketThreshold]
        : [],
      enableTicketRange:
        isNumber(asset.riskAutomaticTicketThreshold) ||
        isNumber(asset.cvssAutomaticTicketThreshold),
      enableExposureMetrics: [
        asset.modifiedAttackVector,
        asset.modifiedAttackComplexity,
        asset.modifiedPrivilegesRequired,
        asset.modifiedScope,
        asset.modifiedUserInteraction,
        asset.modifiedConfidentiality,
        asset.modifiedIntegrity,
        asset.modifiedAvailability,
      ].some((v) => v && v !== "X"),
    },
  });
};
