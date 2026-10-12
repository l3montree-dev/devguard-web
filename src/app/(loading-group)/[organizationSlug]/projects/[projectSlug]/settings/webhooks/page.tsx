// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import WebhooksSection from "@/components/common/settings/WebhooksSection";
import { useProjectScope } from "@/hooks/useProjectScope";

export default function ProjectWebhooksPage() {
  const scope = useProjectScope();

  return <WebhooksSection scope={{ level: "project", ...scope }} />;
}
