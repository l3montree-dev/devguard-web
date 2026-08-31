// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import AssetHeader from "@/components/common/AssetHeader";
import React, { Suspense } from "react";
import { AssetProvider } from "../../../../../../../context/AssetContext";
import { ClientContextWrapper } from "../../../../../../../context/ClientContextWrapper";
import { fetchAsset } from "../../../../../../../data-fetcher/fetchAsset";
import { handleHttpError } from "../../../../../../../data-fetcher/handleHttpError";

export default function AssetLayout({
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
}) {
  return (
    <Suspense>
      <AssetShell params={params}>{children}</AssetShell>
    </Suspense>
  );
}

async function AssetShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  }>;
}) {
  const { organizationSlug, projectSlug, assetSlug } = await params;

  let asset;
  try {
    asset = await fetchAsset(
      decodeURIComponent(organizationSlug),
      projectSlug,
      assetSlug,
    );
  } catch (error) {
    handleHttpError(error, organizationSlug);
  }

  return (
    <ClientContextWrapper Provider={AssetProvider} value={asset}>
      <AssetHeader />
      {children}
    </ClientContextWrapper>
  );
}
