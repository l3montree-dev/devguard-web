// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import ConfigFileEditor from "@/components/common/ConfigFileEditor";
import Page from "@/components/Page";
import AssetTitle from "@/components/common/AssetTitle";
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
    <Page title={asset?.name || ""} Menu={assetMenu} Title={<AssetTitle />}>
      <ConfigFileEditor baseUrl={baseUrl} />
    </Page>
  );
};

export default Config;
