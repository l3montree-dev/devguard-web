// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { uniqBy } from "lodash";
import { useEffect } from "react";
import useSWRMutation from "swr/mutation";

import { useSession, useUpdateSession } from "@/context/SessionContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { readLocalStorage, writeLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/lib/toast";
import { browserClient, unwrap } from "@/services/apiClient";
import type { OrganizationDTO } from "@/types/dto";

const SYNC_INTERVAL_MS = 1000 * 60 * 60;

export const useOrgSync = () => {
  const user = useCurrentUser();
  const orgs = useSession().organizations;
  const updateOrganizations = useUpdateSession();

  const { trigger, isMutating } = useSWRMutation(
    "/trigger-sync",
    async () =>
      unwrap(
        await browserClient.GET("/trigger-sync"),
      ) as unknown as Array<OrganizationDTO>,
    {
      onSuccess: (data) => {
        toast.success("Organization synced successfully");
        updateOrganizations((prev) => ({
          ...prev,
          organizations: uniqBy(data.concat(orgs), "id"),
        }));
      },
      onError: () => toast.error("Failed to sync organization"),
    },
  );

  useEffect(() => {
    if (!user) return;
    const lastSync = readLocalStorage(`lastSync-${user.id}`);
    if (
      lastSync &&
      new Date().getTime() - new Date(lastSync).getTime() <= SYNC_INTERVAL_MS
    ) {
      return;
    }
    writeLocalStorage(`lastSync-${user.id}`, new Date().toISOString());
    trigger();
  }, [user, trigger]);

  return isMutating;
};
