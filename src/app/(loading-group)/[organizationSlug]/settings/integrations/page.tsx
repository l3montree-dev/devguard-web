// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Section from "@/components/common/Section";
import OrgIntegrationsSettings from "@/components/organization/settings/OrgIntegrationsSettings";

export default function OrgIntegrationsPage() {
  return (
    <Section
      forceVertical
      primaryHeadline
      title="Third-party integrations"
      description="Manage any third party integrations. You can connect the organization with a GitHub App Installation, a JIRA Project any many more."
    >
      <OrgIntegrationsSettings />
    </Section>
  );
}
