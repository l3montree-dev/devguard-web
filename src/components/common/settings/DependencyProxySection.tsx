// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import DependencyProxyConfigs from "@/components/common/DependencyProxyConfigs";
import Section from "@/components/common/Section";
import type { ProxyScope } from "@/hooks/useDependencyProxy";

const DependencyProxySection = ({ scope }: { scope: ProxyScope }) => (
  <Section
    forceVertical
    primaryHeadline
    title="Dependency proxy"
    description="Caches dependencies to speed up builds and reduce load on external package registries."
  >
    <DependencyProxyConfigs forceVertical scope={scope} />
  </Section>
);

export default DependencyProxySection;
