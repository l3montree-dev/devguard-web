// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import Page from "@/components/Page";
import Section from "@/components/common/Section";
import DetailedLogsTable from "@/components/logs/DetailedLogsTable";
import { useLogs } from "@/hooks/useLogs";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";

const Logs = () => {
  const orgMenu = useOrganizationMenu();
  const { data: logs, isLoading } = useLogs();

  return (
    <Page
      breadcrumbs={[
        { title: "Settings", href: "./" },
        { title: "Logs", href: "" },
      ]}
      title={"Organization Logs"}
      Menu={orgMenu}
    >
      <Section
        id="logs"
        title="Logs"
        forceVertical
        description="Errors and events captured by DevGuard while processing this organization, such as scan failures or unexpected exceptions."
      >
        <DetailedLogsTable logs={logs} isLoading={isLoading} />
      </Section>
    </Page>
  );
};

export default Logs;
