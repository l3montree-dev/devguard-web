// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import WebhookSettings from "@/components/asset/settings/WebhookSettings";
import Section from "@/components/common/Section";

export default function WebhooksPage() {
  return (
    <Section
      forceVertical
      primaryHeadline
      title="Incoming Webhooks"
      description="Details for configuring incoming webhooks to receive for example issue updates from your issue tracker."
    >
      <WebhookSettings />
    </Section>
  );
}
