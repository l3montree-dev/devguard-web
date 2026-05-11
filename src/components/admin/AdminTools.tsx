// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect, useState } from "react";
import ExternalOrgAdminCard, {
  type ExternalOrg,
} from "@/components/admin/ExternalOrgAdminCard";
import InstanceSettingsCard from "@/components/admin/InstanceSettingsCard";
import TriggerDaemonsCard from "@/components/admin/TriggerDaemonsCard";
import { useInstanceAdmin } from "@/context/InstanceAdminContext";
import { adminBrowserApiClient } from "@/services/adminApi";

export default function AdminTools() {
  const { getPrivateKey } = useInstanceAdmin();
  const [externalOrgs, setExternalOrgs] = useState<ExternalOrg[]>([]);

  useEffect(() => {
    const load = async () => {
      const privateKey = getPrivateKey();
      if (!privateKey) return;
      try {
        const resp = await adminBrowserApiClient(
          "/admin/external-orgs",
          privateKey,
        );
        if (resp.ok) {
          const data = (await resp.json()) as ExternalOrg[];
          setExternalOrgs(data);
        }
      } catch {
        // non-fatal — card will render with no orgs
      }
    };
    load();
  }, [getPrivateKey]);

  return (
    <div className="flex flex-col gap-4">
      <ExternalOrgAdminCard orgs={externalOrgs} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <InstanceSettingsCard />
        <TriggerDaemonsCard />
      </div>
    </div>
  );
}
