// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AssetTitle from "@/components/common/AssetTitle";
import CompliancePosturesListView from "@/components/compliance-posturers/CompliancePosturesListView";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const assetMenu = useAssetMenu();

  const scope = {
    level: "assetVersion",
    organization: organizationSlug,
    projectSlug,
    assetSlug,
    assetVersionSlug,
  } as const;

  return (
    <CompliancePosturesListView
      scope={scope}
      Menu={assetMenu}
      Title={<AssetTitle />}
    />
  );
};

export default Index;
