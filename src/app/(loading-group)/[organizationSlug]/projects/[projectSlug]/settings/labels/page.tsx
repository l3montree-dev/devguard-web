// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import LabelsTable from "@/components/LabelsTable";
import { useProjectScope } from "@/hooks/useProjectScope";

export default function ProjectLabelsPage() {
  const { organization, projectSlug } = useProjectScope();

  return (
    <LabelsTable scope={{ level: "project", organization, projectSlug }} />
  );
}
