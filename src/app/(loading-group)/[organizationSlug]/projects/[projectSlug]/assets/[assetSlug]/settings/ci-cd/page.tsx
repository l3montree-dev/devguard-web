// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { EssentialProjectConfigContent } from "@/components/common/EssentialProjectConfigDrawer";
import Section from "@/components/common/Section";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetScope } from "@/hooks/useAssetScope";

export default function CiCdPage() {
  const { organization, projectSlug, assetSlug } = useAssetScope();
  const { repositoryProvider } = useActiveAsset()!;

  return (
    <Section
      forceVertical
      primaryHeadline
      title="CI/CD"
      description="These values are required to connect your CI/CD pipeline or tooling to this asset."
    >
      <EssentialProjectConfigContent
        organizationSlug={organization}
        projectSlug={projectSlug}
        assetSlug={assetSlug}
        repositoryProvider={repositoryProvider as "github" | "gitlab"}
      />
    </Section>
  );
}
