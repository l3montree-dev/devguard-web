// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import ExternalOrgAdminCard from "@/components/admin/ExternalOrgAdminCard";
import InstanceSettingsCard from "@/components/admin/InstanceSettingsCard";
import TriggerDaemonsCard from "@/components/admin/TriggerDaemonsCard";

export default function AdminTools() {
  return (
    <div className="flex flex-col gap-4">
      <ExternalOrgAdminCard />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <InstanceSettingsCard />
        <TriggerDaemonsCard />
      </div>
    </div>
  );
}
