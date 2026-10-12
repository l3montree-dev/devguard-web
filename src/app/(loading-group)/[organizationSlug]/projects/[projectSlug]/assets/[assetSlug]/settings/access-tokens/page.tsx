// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AccessTokenManagement from "@/components/AccessTokenManagement";
import { useAssetScope } from "@/hooks/useAssetScope";

export default function AccessTokensPage() {
  const { organization, projectSlug, assetSlug } = useAssetScope();

  return (
    <AccessTokenManagement
      url={`/organizations/${organization}/projects/${projectSlug}/assets/${assetSlug}/pats/`}
      section={{
        title: "Access tokens",
        description:
          "Manage your repository access tokens that scanners and other integrations use to authenticate with DevGuard.",
        forceVertical: true,
        primaryHeadline: true,
      }}
    />
  );
}
