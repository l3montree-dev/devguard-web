// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Section from "@/components/common/Section";
import GettingStartedSteps from "@/components/onboarding/GettingStartedSteps";
import OrgRegisterForm from "@/components/OrgRegister";
import Page from "@/components/Page";
import { useSession } from "../../../context/SessionContext";
import { redirect } from "next/navigation";
import { useConfig } from "../../../context/ConfigContext";

export default function SetupOrg() {
  const session = useSession();
  const instanceSettings = useConfig();

  if (session.session === null) {
    redirect("/login");
  }

  if (instanceSettings?.singleOrganizationMode) {
    redirect("/accept-invitation");
  }

  return (
    <Page title="Setup Your Organization">
      <Section primaryHeadline forceVertical title="Welcome to DevGuard 🚀">
        <GettingStartedSteps current="organization">
          <OrgRegisterForm variant="onCard" withSection={false} />
        </GettingStartedSteps>
      </Section>
    </Page>
  );
}
