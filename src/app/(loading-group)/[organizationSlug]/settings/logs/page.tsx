// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import LogsSection from "@/components/common/settings/LogsSection";

export default function OrgLogsPage() {
  return (
    <LogsSection description="Errors and events captured by DevGuard while processing this organization, such as scan failures or unexpected exceptions." />
  );
}
