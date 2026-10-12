// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import DependencyProxySection from "@/components/common/settings/DependencyProxySection";
import { useActiveOrg } from "@/hooks/useActiveOrg";

export default function OrgDependencyProxyPage() {
  const { slug } = useActiveOrg();

  return (
    <DependencyProxySection
      scope={{ level: "organization", organization: slug }}
    />
  );
}
