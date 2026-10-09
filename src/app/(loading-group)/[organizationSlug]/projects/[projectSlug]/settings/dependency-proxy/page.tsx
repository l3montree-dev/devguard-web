// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import DependencyProxySection from "@/components/common/settings/DependencyProxySection";
import { useProjectScope } from "@/hooks/useProjectScope";

export default function ProjectDependencyProxyPage() {
  const scope = useProjectScope();

  return <DependencyProxySection scope={{ level: "project", ...scope }} />;
}
