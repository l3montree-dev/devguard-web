// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CompliancePosturesListView from "@/components/compliance-posturers/CompliancePosturesListView";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const asset = useActiveAsset();
  const assetName = asset.name;

  const scope = {
    level: "assetVersion",
    organization: organizationSlug,
    projectSlug,
    assetSlug,
    assetVersionSlug,
  } as const;

  return <CompliancePosturesListView scope={scope} contextName={assetName} />;
};

export default Index;
