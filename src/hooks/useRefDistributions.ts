// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { groupBy, mapValues } from "lodash";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "../data-fetcher/fetcher";
import type { RiskHistory } from "@/types/dto";
import useDecodedParams from "./useDecodedParams";

export interface RefDistribution {
  low: string[];
  medium: string[];
  high: string[];
  critical: string[];
}

const dateOnly = (ms: number) => new Date(ms).toISOString().split("T")[0];
const start = dateOnly(Date.now() - 30 * 864e5);
const end = dateOnly(Date.now());

export function useRefDistributions() {
  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };
  const artifactName = useSearchParams()?.get("artifact");

  const { data: riskHistories, isLoading } = useSWR<RiskHistory[]>(
    `/organizations/${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}/stats/risk-history/?start=${start}&end=${end}` +
      (artifactName ? `&artifactName=${encodeURIComponent(artifactName)}` : ""),
    fetcher,
  );

  const distributionByRef = useMemo(() => {
    const latest: Record<string, RiskHistory> = {};
    for (const history of riskHistories ?? []) {
      latest[history.assetVersionName + "|" + history.artifactName] = history;
    }
    const val = mapValues(
      groupBy(Object.values(latest), "assetVersionName"),
      (rows): RefDistribution => ({
        low: rows.flatMap((x) => x.cvePurlLowCvss).filter((x) => x != null),
        medium: rows
          .flatMap((x) => x.cvePurlMediumCvss)
          .filter((x) => x != null),
        high: rows.flatMap((x) => x.cvePurlHighCvss).filter((x) => x != null),
        critical: rows
          .flatMap((x) => x.cvePurlCriticalCvss)
          .filter((x) => x != null),
      }),
    );
    return val;
  }, [riskHistories]);

  return { distributionByRef, isLoading };
}
