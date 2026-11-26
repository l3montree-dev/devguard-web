// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useForm } from "react-hook-form";
import type { AssetFormValues } from "@/types/view/asset";
import { useActiveAsset } from "./useActiveAsset";

export const useAssetSettingsForm = () => {
  const asset = useActiveAsset()!;
  const ticketRangeCelExpression = asset.ticketRangeCelExpression ?? "";

  return useForm<AssetFormValues>({
    defaultValues: {
      ...asset,
      ticketRangeCelExpression,
      enableTicketRange: ticketRangeCelExpression !== "",
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
