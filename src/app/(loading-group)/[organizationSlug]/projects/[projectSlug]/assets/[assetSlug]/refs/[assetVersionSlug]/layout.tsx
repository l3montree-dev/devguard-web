// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { fetchAssetVersion } from "@/data-fetcher/fetchAssetVersion";
import React, { Suspense } from "react";
import { AssetVersionProvider } from "../../../../../../../../../context/AssetVersionContext";
import { ClientContextWrapper } from "../../../../../../../../../context/ClientContextWrapper";
import { fetchArtifacts } from "../../../../../../../../../data-fetcher/fetchArtifacts";
import { handleHttpError } from "../../../../../../../../../data-fetcher/handle-http-error";

const AssetVersionLayout = ({
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
  return (
    <Suspense>
      <AssetVersionShell params={params}>{children}</AssetVersionShell>
    </Suspense>
  );
};

async function AssetVersionShell({
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
}) {
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    await params;

  try {
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
  } catch (error) {
    handleHttpError(error, organizationSlug);
  }
}

export default AssetVersionLayout;
