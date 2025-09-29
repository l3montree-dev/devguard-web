import React from "react";
import { AssetVersionProvider } from "../../../../../../../../context/AssetVersionContext";
import { withArtifacts } from "../../../../../../../../decorators/approuter/withArtifacts";
import { ClientContextWrapper } from "../../../../../../../../context/ClientContextWrapper";
import { withAsset } from "../../../../../../../../decorators/approuter/withAsset";

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
    withAsset(organizationSlug, projectSlug, assetSlug),
    withArtifacts(organizationSlug, projectSlug, assetSlug, assetVersionSlug),
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
