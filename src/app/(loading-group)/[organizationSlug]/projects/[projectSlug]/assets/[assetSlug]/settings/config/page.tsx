// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

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

  const scope =
    org && project && asset
      ? ({
          level: "asset",
          organization: org.slug,
          projectSlug: project.slug,
          assetSlug: asset.slug,
        } as const)
      : null;

  return (
    <Page
      breadcrumbs={[
        {
          title: "Settings",
          href: "./",
        },
        {
          title: "Config",
          href: "",
        },
      ]}
      title={asset?.name || ""}
      Menu={assetMenu}
      Title={<AssetTitle />}
    >
      <ConfigFileEditor scope={scope} />
    </Page>
  );
};

export default Config;
