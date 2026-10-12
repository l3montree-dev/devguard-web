// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Section from "@/components/common/Section";
import { orgSettingsTourSteps } from "@/components/common/tours/orgSettingsTour";
import OrgGeneralSettings from "@/components/organization/settings/OrgGeneralSettings";
import { useAutoTour } from "@/hooks/useAutoTour";

export default function OrgGeneralSettingsPage() {
  useAutoTour("org-settings", orgSettingsTourSteps);

  return (
    <Section
      forceVertical
      primaryHeadline
      title="General"
      description="Enter the name of your organization. This will be used to identify your organization in the system."
    >
      <OrgGeneralSettings />
    </Section>
  );
}
