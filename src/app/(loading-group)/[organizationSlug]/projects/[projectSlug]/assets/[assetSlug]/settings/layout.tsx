// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Page from "@/components/Page";
import AssetSettingsNav from "@/components/asset/settings/AssetSettingsNav";
import AssetTitle from "@/components/common/AssetTitle";
import SettingsShell from "@/components/common/settings/SettingsShell";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import type { PropsWithChildren } from "react";

export default function AssetSettingsLayout({ children }: PropsWithChildren) {
  const assetMenu = useAssetMenu();
  const asset = useActiveAsset()!;

  return (
    <Page
      Menu={assetMenu}
      title={"Settings (" + asset.name + ")"}
      description="Update the settings of this repository"
      Title={<AssetTitle />}
    >
      <SettingsShell nav={<AssetSettingsNav />}>{children}</SettingsShell>
    </Page>
  );
}
