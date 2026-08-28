// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AssetTitle from "@/components/common/AssetTitle";
import CompliancePostureDetailView from "@/components/compliance-posturers/CompliancePostureDetailView";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug, vulnId } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
      vulnId: string;
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
    <CompliancePostureDetailView
      scope={scope}
      vulnId={vulnId}
      Menu={assetMenu}
      Title={<AssetTitle />}
      showTicketCreation={true}
    />
  );
};

export default Index;
