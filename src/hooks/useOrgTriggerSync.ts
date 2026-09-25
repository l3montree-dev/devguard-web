// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useEffect } from "react";
import useSWRMutation from "swr/mutation";

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { readLocalStorage, writeLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/lib/toast";
import { browserClient, unwrap } from "@/services/apiClient";

const SYNC_INTERVAL_MS = 1000 * 60 * 60;

export const useOrgTriggerSync = (onSynced: () => void) => {
  const activeOrg = useActiveOrg();

  const { trigger, isMutating } = useSWRMutation(
    `/organizations/${activeOrg.slug}/trigger-sync`,
    async () => {
      unwrap(
        await browserClient.GET("/organizations/{organization}/trigger-sync", {
          params: {
            path: { organization: decodeURIComponent(activeOrg.slug) },
          },
        }),
      );
    },
    {
      onSuccess: () => {
        toast.success("Sync triggered successfully!");
        onSynced();
      },
      onError: () =>
        toast.error("Failed to trigger sync. Please try again later."),
    },
  );

  useEffect(() => {
    if (!activeOrg.externalEntityProviderId) return;
    const lastSync = readLocalStorage(`lastSync-${activeOrg.slug}`);
    if (
      lastSync &&
      new Date().getTime() - new Date(lastSync).getTime() <= SYNC_INTERVAL_MS
    ) {
      return;
    }
    writeLocalStorage(`lastSync-${activeOrg.slug}`, new Date().toISOString());
    trigger();
  }, [activeOrg.externalEntityProviderId, activeOrg.slug, trigger]);

  return { triggerSync: trigger, syncRunning: isMutating };
};
