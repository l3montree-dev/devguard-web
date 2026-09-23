// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import Page from "@/components/Page";
import Section from "@/components/common/Section";
import DetailedLogsTable from "@/components/logs/DetailedLogsTable";
import { useLogs } from "@/hooks/useLogs";
import { useAssetMenu } from "@/hooks/useAssetMenu";

const Logs = () => {
  const assetMenu = useAssetMenu();
  const { data: logs, isLoading } = useLogs();

  return (
    <Page
      breadcrumbs={[
        { title: "Settings", href: "./" },
        { title: "Logs", href: "" },
      ]}
      title={"Repository Logs"}
      Menu={assetMenu}
    >
      <Section
        id="logs"
        title="Logs"
        forceVertical
        description="Errors and events captured by DevGuard while processing this repository, such as scan failures or unexpected exceptions."
      >
        <DetailedLogsTable logs={logs} isLoading={isLoading} />
      </Section>
    </Page>
  );
};

export default Logs;
