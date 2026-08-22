// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { fetchSession } from "@/data-fetcher/fetchSession";
import oryConfig from "@/ory.config";
import { getSettingsFlow } from "@ory/nextjs/app";
import type { OryPageParams } from "@ory/nextjs/app";
import { redirect } from "next/navigation";
import Page from "../../../components/Page";
import UserSettings from "../../../components/UserSettings";
import PatManagementSection from "./PatManagementSection";

const SettingsPage = async (props: OryPageParams) => {
  if (!(await fetchSession())) {
    redirect("/login?return_to=/user-settings");
  }

  const flow = await getSettingsFlow(oryConfig, props.searchParams);

  if (!flow) {
    return null;
  }

  return (
    <Page title="Profile Management and Security Settings">
      <div className="dark:text-white">
        <UserSettings flow={flow as any} config={oryConfig} />
        <PatManagementSection />
      </div>
    </Page>
  );
};

export default SettingsPage;
