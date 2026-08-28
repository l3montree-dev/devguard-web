// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import ComplianceComponentsListView from "@/components/compliance-posturers/ComplianceComponentsListView";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";

const Index = () => {
  const orgMenu = useOrganizationMenu();

  return <ComplianceComponentsListView Menu={orgMenu} />;
};

export default Index;
