// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CompliancePosturesListView from "@/components/compliance-posturers/CompliancePosturesListView";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug } = useDecodedParams() as {
    organizationSlug: string;
  };

  const orgMenu = useOrganizationMenu();

  const apiBaseUrl =
    "/organizations/" + organizationSlug + "/compliance-postures/";

  return <CompliancePosturesListView apiBaseUrl={apiBaseUrl} Menu={orgMenu} />;
};

export default Index;
