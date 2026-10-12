// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import DependencyProxySection from "@/components/common/settings/DependencyProxySection";
import { useAssetScope } from "@/hooks/useAssetScope";

export default function DependencyProxyPage() {
  const scope = useAssetScope();

  return <DependencyProxySection scope={{ level: "asset", ...scope }} />;
}
