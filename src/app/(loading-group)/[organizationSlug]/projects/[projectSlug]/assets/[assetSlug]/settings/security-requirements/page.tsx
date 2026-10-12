// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import SecurityRequirementsSettings from "@/components/asset/settings/SecurityRequirementsSettings";
import Section from "@/components/common/Section";

export default function SecurityRequirementsPage() {
  return (
    <Section
      forceVertical
      primaryHeadline
      title="Security requirements"
      description="Security requirements are criteria that your repository must meet to ensure the protection of data, maintain integrity, confidentiality, and availability. They are used in risk calculations to help you prioritize."
    >
      <SecurityRequirementsSettings />
    </Section>
  );
}
