"use client";

import CompliancePosturesListView from "@/components/compliance-posturers/CompliancePosturesListView";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug } = useDecodedParams() as {
    organizationSlug: string;
  };

  const orgMenu = useOrganizationMenu();

  const apiBaseUrl = "/organizations/" + organizationSlug + "/compliance-postures/";

  return (
    <CompliancePosturesListView
      apiBaseUrl={apiBaseUrl}
      Menu={orgMenu}
    />
  );
};

export default Index;
