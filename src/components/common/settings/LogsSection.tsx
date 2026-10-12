// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Section from "@/components/common/Section";
import DetailedLogsTable from "@/components/logs/DetailedLogsTable";
import { useLogs } from "@/hooks/useLogs";

const LogsSection = ({ description }: { description: string }) => {
  const { data: logs, isLoading } = useLogs();

  return (
    <Section
      forceVertical
      primaryHeadline
      title="Logs"
      description={description}
    >
      <DetailedLogsTable logs={logs} isLoading={isLoading} />
    </Section>
  );
};

export default LogsSection;
