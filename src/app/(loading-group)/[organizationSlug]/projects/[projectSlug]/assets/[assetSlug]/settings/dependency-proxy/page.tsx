// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import Page from "@/components/Page";
import AssetTitle from "@/components/common/AssetTitle";
import DependencyProxySettings from "@/components/common/DependencyProxySettings";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";

const Config = () => {
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const assetMenu = useAssetMenu();

  const baseUrl =
    org && project && asset
      ? "/organizations/" +
        org.slug +
        "/projects/" +
        project.slug +
        "/assets/" +
        asset.slug
      : null;

  return (
    <Page
      breadcrumbs={[
        {
          title: "Settings",
          href: "./",
        },
        {
          title: "Dependency Proxy",
          href: "",
        },
      ]}
      title={asset?.name || ""}
      Menu={assetMenu}
      Title={<AssetTitle />}
    >
      <DependencyProxySettings baseUrl={baseUrl} />
    </Page>
  );
};

export default Config;
