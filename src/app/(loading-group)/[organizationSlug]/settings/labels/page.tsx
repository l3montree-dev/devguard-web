// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import LabelsTable from "@/components/LabelsTable";
import { useActiveOrg } from "@/hooks/useActiveOrg";

export default function OrgLabelsPage() {
  const { slug } = useActiveOrg();

  return <LabelsTable scope={{ level: "organization", organization: slug }} />;
}
