// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Page from "@/components/Page";
import SettingsShell from "@/components/common/settings/SettingsShell";
import UserSettingsNav from "@/components/user-settings/UserSettingsNav";
import { fetchSession } from "@/data-fetcher/fetchSession";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { OrganizationDetailsDTO } from "@/types/dto";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ClientContextWrapper } from "../../../context/ClientContextWrapper";
import { OrganizationProvider } from "../../../context/OrganizationContext";

export default async function UserSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await fetchSession())) {
    redirect("/login?return_to=/user-settings");
  }

  return (
    <ClientContextWrapper
      Provider={OrganizationProvider}
      value={{
        organization: {
          id: "",
          name: "User Settings",
          slug: "/",
        } as OrganizationDetailsDTO,
      }}
    >
      <TooltipProvider delayDuration={100}>
        <Page title="User Settings">
          <SettingsShell nav={<UserSettingsNav />}>{children}</SettingsShell>
        </Page>
      </TooltipProvider>
    </ClientContextWrapper>
  );
}
