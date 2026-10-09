// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import ConfigFilesSection from "@/components/common/settings/ConfigFilesSection";
import { useAssetScope } from "@/hooks/useAssetScope";

export default function ConfigPage() {
  const scope = useAssetScope();

  return (
    <ConfigFilesSection
      scope={{ level: "asset", ...scope }}
      description="View and edit configuration files for this repository, including scanner tool settings. These configurations override project-level settings for this specific repository."
    />
  );
}
