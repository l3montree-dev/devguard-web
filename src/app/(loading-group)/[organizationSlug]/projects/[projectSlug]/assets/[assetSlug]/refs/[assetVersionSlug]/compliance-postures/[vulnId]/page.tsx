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

  const apiBaseUrl =
    "/organizations/" +
    organizationSlug +
    "/projects/" +
    projectSlug +
    "/assets/" +
    assetSlug +
    "/refs/" +
    assetVersionSlug +
    "/compliance-postures/";

  return (
    <CompliancePostureDetailView
      apiBaseUrl={apiBaseUrl}
      vulnId={vulnId}
      Menu={assetMenu}
      Title={<AssetTitle />}
      showTicketCreation={true}
    />
  );
};

export default Index;
