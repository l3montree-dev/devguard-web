import React from "react";
import { ClientContextWrapper } from "../../../../../../context/ClientContextWrapper";
import { AssetProvider } from "../../../../../../context/AssetContext";
import { withAsset } from "../../../../../../decorators/approuter/withAsset";
import { HttpError } from "../../../../../../decorators/middleware";
import { redirect } from "next/navigation";
import { withArtifacts } from "../../../../../../decorators/withArtifacts";

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
  try {
    const [asset] = await Promise.all([
      withAsset(organizationSlug, projectSlug, assetSlug),
    ]);

    return (
      <ClientContextWrapper Provider={AssetProvider} value={asset}>
        {children}
      </ClientContextWrapper>
    );
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.instructions && "redirect" in error.instructions) {
        return redirect(error.instructions.redirect.destination);
      }
    }
    throw error;
  }
};

export default AssetLayout;
