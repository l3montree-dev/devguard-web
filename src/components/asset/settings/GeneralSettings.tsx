// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { AssetFormGeneral } from "@/components/asset/asset-form/AssetFormGeneral";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetSettingsForm } from "@/hooks/useAssetSettingsForm";
import { useAssetUpdate } from "@/hooks/useAssetUpdate";
import { FormProvider } from "react-hook-form";

const GeneralSettings = () => {
  const asset = useActiveAsset()!;
  const form = useAssetSettingsForm();
  const handleUpdate = useAssetUpdate();

  return (
    <FormProvider {...form}>
      <AssetFormGeneral
        form={form}
        disable={Boolean(asset.externalEntityProviderId)}
        onUpdate={handleUpdate}
      />
    </FormProvider>
  );
};

export default GeneralSettings;
