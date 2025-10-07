import AssetHeader from "@/components/common/AssetHeader";
import { redirect } from "next/navigation";
import React from "react";
import { AssetProvider } from "../../../../../../../context/AssetContext";
import { ClientContextWrapper } from "../../../../../../../context/ClientContextWrapper";
import { fetchAsset } from "../../../../../../../data-fetcher/fetchAsset";
import { HttpError } from "../../../../../../../data-fetcher/http-error";

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
      fetchAsset(organizationSlug, projectSlug, assetSlug),
    ]);

    return (
      <ClientContextWrapper Provider={AssetProvider} value={asset}>
        <AssetHeader />
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
