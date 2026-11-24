// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import SecretsTable from "@/components/SecretsTable";
import { useActiveOrg } from "@/hooks/useActiveOrg";

export default function OrgSecretsPage() {
  const { slug } = useActiveOrg();

  return <SecretsTable scope={{ level: "organization", organization: slug }} />;
}
