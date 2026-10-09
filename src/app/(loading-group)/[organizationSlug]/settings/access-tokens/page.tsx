// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AccessTokenManagement from "@/components/AccessTokenManagement";
import { useActiveOrg } from "@/hooks/useActiveOrg";

export default function OrgAccessTokensPage() {
  const { slug } = useActiveOrg();

  return (
    <AccessTokenManagement
      url={`/organizations/${slug}/pats/`}
      section={{
        title: "Access tokens",
        description:
          "Manage your organization access tokens that scanners and other integrations use to authenticate with DevGuard.",
        forceVertical: true,
        primaryHeadline: true,
      }}
    />
  );
}
