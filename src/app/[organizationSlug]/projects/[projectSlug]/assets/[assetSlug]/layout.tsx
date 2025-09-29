import React from "react";
import { ClientContextWrapper } from "../../../../../../context/ClientContextWrapper";
import { AssetProvider } from "../../../../../../context/AssetContext";
import { withAsset } from "../../../../../../decorators/approuter/withAsset";

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
  const [project] = await Promise.all([
    withAsset(organizationSlug, projectSlug, assetSlug),
  ]);

  return (
    <ClientContextWrapper Provider={AssetProvider} value={project}>
      {children}
    </ClientContextWrapper>
  );
};

export default AssetLayout;
