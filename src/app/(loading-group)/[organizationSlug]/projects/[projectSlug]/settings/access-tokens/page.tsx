// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AccessTokenManagement from "@/components/AccessTokenManagement";
import { useProjectScope } from "@/hooks/useProjectScope";

export default function ProjectAccessTokensPage() {
  const { organization, projectSlug } = useProjectScope();

  return (
    <AccessTokenManagement
      url={`/organizations/${organization}/projects/${projectSlug}/pats/`}
      section={{
        title: "Access tokens",
        description:
          "Manage your group access tokens that scanners and other integrations use to authenticate with DevGuard on your behalf.",
        forceVertical: true,
        primaryHeadline: true,
      }}
    />
  );
}
