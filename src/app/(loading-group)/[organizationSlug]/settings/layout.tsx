// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Page from "@/components/Page";
import SettingsShell from "@/components/common/settings/SettingsShell";
import OrgSettingsNav from "@/components/organization/settings/OrgSettingsNav";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import type { PropsWithChildren } from "react";

export default function OrgSettingsLayout({ children }: PropsWithChildren) {
  const orgMenu = useOrganizationMenu();
  const org = useActiveOrg();

  return (
    <Page title={"Settings (" + org.name + ")"} Menu={orgMenu}>
      <SettingsShell nav={<OrgSettingsNav />}>{children}</SettingsShell>
    </Page>
  );
}
