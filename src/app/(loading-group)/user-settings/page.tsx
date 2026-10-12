// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Section from "@/components/common/Section";
import UserSettings from "@/components/UserSettings";
import oryConfig from "@/ory.config";
import { getSettingsFlow } from "@ory/nextjs/app";
import type { OryPageParams } from "@ory/nextjs/app";

export default async function AccountSettingsPage(props: OryPageParams) {
  const flow = await getSettingsFlow(oryConfig, props.searchParams);

  if (!flow) {
    return null;
  }

  return (
    <Section
      forceVertical
      primaryHeadline
      title="Account"
      description="Manage your profile, password and two-factor authentication."
    >
      <div className="dark:text-white">
        <UserSettings flow={flow as any} config={oryConfig} />
      </div>
    </Section>
  );
}
