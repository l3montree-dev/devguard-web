// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import ComplianceComponentsListView from "@/components/compliance-posturers/ComplianceComponentsListView";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { useActiveOrg } from "@/hooks/useActiveOrg";

const Index = () => {
  const orgMenu = useOrganizationMenu();
  const activeOrg = useActiveOrg();
  const orgName = activeOrg.name;

  return <ComplianceComponentsListView Menu={orgMenu} contextName={orgName} />;
};

export default Index;
