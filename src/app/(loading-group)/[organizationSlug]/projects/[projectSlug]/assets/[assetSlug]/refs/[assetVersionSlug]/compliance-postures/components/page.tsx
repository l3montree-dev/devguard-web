// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import ComplianceComponentsListView from "@/components/compliance-posturers/ComplianceComponentsListView";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };

  const asset = useActiveAsset();
  const assetName = asset.name;

  // components apply to every version of the asset
  const scope = {
    level: "asset",
    organization: organizationSlug,
    projectSlug,
    assetSlug,
  } as const;

  return <ComplianceComponentsListView scope={scope} contextName={assetName} />;
};

export default Index;
