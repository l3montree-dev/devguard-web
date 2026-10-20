// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { AssetFormRequirements } from "@/components/asset/asset-form/AssetFormRequirements";
import { useAssetSettingsForm } from "@/hooks/useAssetSettingsForm";
import { useAssetUpdate } from "@/hooks/useAssetUpdate";
import { FormProvider } from "react-hook-form";

const SecurityRequirementsSettings = () => {
  const form = useAssetSettingsForm();
  const handleUpdate = useAssetUpdate();

  return (
    <FormProvider {...form}>
      <AssetFormRequirements form={form} onUpdate={handleUpdate} />
    </FormProvider>
  );
};

export default SecurityRequirementsSettings;
