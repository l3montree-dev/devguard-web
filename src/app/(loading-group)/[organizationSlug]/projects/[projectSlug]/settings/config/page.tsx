// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import ConfigFilesSection from "@/components/common/settings/ConfigFilesSection";
import { useProjectScope } from "@/hooks/useProjectScope";

export default function ProjectConfigPage() {
  const scope = useProjectScope();

  return (
    <ConfigFilesSection
      scope={{ level: "project", ...scope }}
      description="View and edit configuration files for this group, including scanner tool settings. These configurations override organization-level settings and are inherited by all repositories in this group."
    />
  );
}
