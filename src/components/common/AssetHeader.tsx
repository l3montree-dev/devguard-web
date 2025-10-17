// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
"use client";

import { useAssetMenu } from "@/hooks/useAssetMenu";
import AssetTitle from "./AssetTitle";
import DynamicHeader from "./DynamicHeader";

export default function AssetHeader() {
  const menu = useAssetMenu();

  return <DynamicHeader z={4} Title={<AssetTitle />} menu={menu} />;
}
