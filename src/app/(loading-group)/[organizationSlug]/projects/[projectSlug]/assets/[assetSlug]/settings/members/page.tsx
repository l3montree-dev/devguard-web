// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import MembersSettings from "@/components/asset/settings/MembersSettings";
import Section from "@/components/common/Section";

export default function MembersPage() {
  return (
    <Section
      forceVertical
      primaryHeadline
      title="Members"
      description="Manage the members of this repository"
    >
      <MembersSettings />
    </Section>
  );
}
