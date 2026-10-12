// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import WebhooksSection from "@/components/common/settings/WebhooksSection";
import { useActiveOrg } from "@/hooks/useActiveOrg";

export default function OrgWebhooksPage() {
  const { slug } = useActiveOrg();

  return (
    <WebhooksSection scope={{ level: "organization", organization: slug }} />
  );
}
