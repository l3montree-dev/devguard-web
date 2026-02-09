import AssetHeader from "@/components/common/AssetHeader";
import React from "react";
import { AssetProvider } from "../../../../../../../context/AssetContext";
import { ClientContextWrapper } from "../../../../../../../context/ClientContextWrapper";
import { fetchAsset } from "../../../../../../../data-fetcher/fetchAsset";

const AssetLayout = async ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  }>;
}) => {
  const { organizationSlug, projectSlug, assetSlug } = await params;

  const [asset] = await Promise.all([
    fetchAsset(decodeURIComponent(organizationSlug), projectSlug, assetSlug),
  ]);

  return (
    <ClientContextWrapper Provider={AssetProvider} value={asset}>
      <AssetHeader />
      {children}
    </ClientContextWrapper>
  );
};

export default AssetLayout;
