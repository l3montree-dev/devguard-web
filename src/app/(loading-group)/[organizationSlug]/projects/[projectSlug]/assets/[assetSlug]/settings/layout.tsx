// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Page from "@/components/Page";
import AssetSettingsNav from "@/components/asset/settings/AssetSettingsNav";
import SettingsShell from "@/components/common/settings/SettingsShell";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import type { PropsWithChildren } from "react";

export default function AssetSettingsLayout({ children }: PropsWithChildren) {
  const asset = useActiveAsset()!;

  return (
    <Page title={"Settings (" + asset.name + ")"}>
      <SettingsShell nav={<AssetSettingsNav />}>{children}</SettingsShell>
    </Page>
  );
}
