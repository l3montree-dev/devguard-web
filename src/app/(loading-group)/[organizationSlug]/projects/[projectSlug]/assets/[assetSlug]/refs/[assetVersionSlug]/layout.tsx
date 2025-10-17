import { fetchAssetVersion } from "@/data-fetcher/fetchAssetVersion";
import React from "react";
import { AssetVersionProvider } from "../../../../../../../../../context/AssetVersionContext";
import { ClientContextWrapper } from "../../../../../../../../../context/ClientContextWrapper";
import { fetchArtifacts } from "../../../../../../../../../data-fetcher/fetchArtifacts";

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
    assetVersionSlug: string;
  }>;
}) => {
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    await params;
  const [assetVersion, artifacts] = await Promise.all([
    fetchAssetVersion(
      decodeURIComponent(organizationSlug),
      projectSlug,
      assetSlug,
      assetVersionSlug,
    ),
    fetchArtifacts(
      decodeURIComponent(organizationSlug),
      projectSlug,
      assetSlug,
      assetVersionSlug,
    ),
  ]);

  return (
    <ClientContextWrapper
      Provider={AssetVersionProvider}
      value={{
        artifacts,
        assetVersion,
      }}
    >
      {children}
    </ClientContextWrapper>
  );
};

export default AssetLayout;
