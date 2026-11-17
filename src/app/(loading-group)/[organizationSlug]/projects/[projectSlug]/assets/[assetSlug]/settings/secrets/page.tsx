// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import SecretsTable from "@/components/SecretsTable";
import { useAssetScope } from "@/hooks/useAssetScope";

export default function AssetSecretsPage() {
  const scope = useAssetScope();

  return <SecretsTable scope={{ level: "asset", ...scope }} />;
}
