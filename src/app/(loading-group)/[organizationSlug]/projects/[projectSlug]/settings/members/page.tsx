// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Section from "@/components/common/Section";
import ProjectMembersSettings from "@/components/project/settings/ProjectMembersSettings";

export default function ProjectMembersPage() {
  return (
    <Section
      forceVertical
      primaryHeadline
      title="Members"
      description="Manage the members of this group"
    >
      <ProjectMembersSettings />
    </Section>
  );
}
