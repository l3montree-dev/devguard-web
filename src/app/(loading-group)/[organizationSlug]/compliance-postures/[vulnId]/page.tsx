"use client";

import CompliancePostureDetailView from "@/components/compliance-posturers/CompliancePostureDetailView";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import useDecodedParams from "@/hooks/useDecodedParams";

const Index = () => {
  const { organizationSlug, vulnId } = useDecodedParams() as {
    organizationSlug: string;
    vulnId: string;
  };

  const orgMenu = useOrganizationMenu();

  const apiBaseUrl = "/organizations/" + organizationSlug + "/compliance-postures/";

  return (
    <CompliancePostureDetailView
      apiBaseUrl={apiBaseUrl}
      vulnId={vulnId}
      Menu={orgMenu}
    />
  );
};

export default Index;
