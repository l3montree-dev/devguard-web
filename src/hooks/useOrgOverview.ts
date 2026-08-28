// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useApiQuery } from "@/hooks/useApiQuery";
import { browserClient, unwrap } from "@/services/apiClient";

const STATS_PATH = "/organizations/{organization}/stats/vuln-statistics/";

const LIMITS = {
  orgComponentsLimit: 5,
  topCVEsLimit: 5,
  topComponentsLimit: 5,
  topEcosystemsLimit: 5,
};

export const useOrgOverview = (organization: string) => {
  const { data, isLoading, error, mutate } = useApiQuery(STATS_PATH, {
    params: { path: { organization }, query: LIMITS },
  });

  // The backend caches these statistics for 15 minutes. forceRefresh bypasses
  // that cache; seeding the SWR cache keeps a plain revalidation from undoing it.
  const refresh = async () => {
    const fresh = unwrap(
      await browserClient.GET(STATS_PATH, {
        params: {
          path: { organization },
          query: { ...LIMITS, forceRefresh: true },
        },
      }),
    );
    await mutate(fresh, { revalidate: false });
  };

  return { data, isLoading, error, refresh };
};
