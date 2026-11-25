// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import LabelsTable from "@/components/LabelsTable";
import { useAssetScope } from "@/hooks/useAssetScope";

export default function AssetLabelsPage() {
  const scope = useAssetScope();

  return <LabelsTable scope={{ level: "asset", ...scope }} />;
}
