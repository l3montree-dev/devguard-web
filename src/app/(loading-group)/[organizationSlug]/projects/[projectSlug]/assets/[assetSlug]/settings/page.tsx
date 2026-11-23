// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AssetVersionRetentionSettings from "@/components/asset/settings/AssetVersionRetentionSettings";
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
      <Section
        forceVertical
        title="Branch and tag retention"
        description="Decide which branches and tags DevGuard keeps. Branches and tags the policy does not keep are deleted by the background pipeline."
      >
        <AssetVersionRetentionSettings />
      </Section>
      <BackgroundJobsDebug />
    </>
  );
}
