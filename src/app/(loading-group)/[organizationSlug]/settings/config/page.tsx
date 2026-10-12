// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import ConfigFilesSection from "@/components/common/settings/ConfigFilesSection";
import { useActiveOrg } from "@/hooks/useActiveOrg";

export default function OrgConfigPage() {
  const { slug } = useActiveOrg();

  return (
    <ConfigFilesSection
      scope={{ level: "organization", organization: slug }}
      description="View and edit configuration files for your organization, including scanner tool settings. These configurations are inherited by all projects and repositories in your organization and can be overridden at the project or repository level."
    />
  );
}
