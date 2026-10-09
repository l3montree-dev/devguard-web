// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import BackgroundJobsDebug from "@/components/asset/settings/BackgroundJobsDebug";
import GeneralSettings from "@/components/asset/settings/GeneralSettings";
import Section from "@/components/common/Section";
import { repoSettingsTourSteps } from "@/components/common/tours/repoSettingsTour";
import { useAutoTour } from "@/hooks/useAutoTour";

export default function GeneralSettingsPage() {
  useAutoTour("repo-settings", repoSettingsTourSteps);

  return (
    <>
      <Section
        forceVertical
        primaryHeadline
        title="General"
        description="The name, description and repository provider of this repository."
      >
        <GeneralSettings />
      </Section>
      <BackgroundJobsDebug />
    </>
  );
}
