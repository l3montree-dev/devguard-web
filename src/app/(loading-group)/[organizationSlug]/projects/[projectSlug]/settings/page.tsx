// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Section from "@/components/common/Section";
import ProjectGeneralSettings from "@/components/project/settings/ProjectGeneralSettings";

export default function ProjectGeneralSettingsPage() {
  return (
    <Section
      forceVertical
      primaryHeadline
      title="General"
      description="The name and description of this group."
    >
      <ProjectGeneralSettings />
    </Section>
  );
}
