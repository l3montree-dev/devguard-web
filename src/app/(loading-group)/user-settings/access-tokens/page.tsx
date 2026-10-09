// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import AccessTokenManagement from "@/components/AccessTokenManagement";

export default function UserAccessTokensPage() {
  return (
    <AccessTokenManagement
      url="/pats/"
      section={{
        title: "Access tokens",
        description:
          "Personal Access Tokens allow scanners and other integrations to authenticate with DevGuard on your behalf.",
        forceVertical: true,
        primaryHeadline: true,
      }}
    />
  );
}
