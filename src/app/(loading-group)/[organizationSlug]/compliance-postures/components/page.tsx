"use client";

import ComplianceComponentsListView from "@/components/compliance-posturers/ComplianceComponentsListView";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";

const Index = () => {
  const orgMenu = useOrganizationMenu();

  return <ComplianceComponentsListView Menu={orgMenu} />;
};

export default Index;
