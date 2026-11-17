// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import SecretsTable from "@/components/SecretsTable";
import { useProjectScope } from "@/hooks/useProjectScope";

export default function ProjectSecretsPage() {
  const { organization, projectSlug } = useProjectScope();

  return (
    <SecretsTable scope={{ level: "project", organization, projectSlug }} />
  );
}
