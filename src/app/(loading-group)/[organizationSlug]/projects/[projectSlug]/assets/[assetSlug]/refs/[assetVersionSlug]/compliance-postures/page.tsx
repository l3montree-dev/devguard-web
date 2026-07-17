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
    <CompliancePosturesListView
      apiBaseUrl={apiBaseUrl}
      Menu={assetMenu}
      Title={<AssetTitle />}
    />
  );
};

export default Index;
