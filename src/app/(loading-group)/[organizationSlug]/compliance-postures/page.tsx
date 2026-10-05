// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CompliancePosturesListView from "@/components/compliance-posturers/CompliancePosturesListView";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import { useActiveOrg } from "@/hooks/useActiveOrg";

const Index = () => {
  const { organizationSlug } = useDecodedParams() as {
    organizationSlug: string;
  };

  const orgMenu = useOrganizationMenu();
  const activeOrg = useActiveOrg();
  const orgName = activeOrg.name;

  const scope = {
    level: "organization",
    organization: organizationSlug,
  } as const;

  return (
    <CompliancePosturesListView
      scope={scope}
      Menu={orgMenu}
      contextName={orgName}
    />
  );
};

export default Index;
