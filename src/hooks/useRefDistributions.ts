import { groupBy, mapValues, sumBy } from "lodash";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "../data-fetcher/fetcher";
import type { RiskHistory } from "../types/api/api";
import useDecodedParams from "./useDecodedParams";

export interface RefDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
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
    return mapValues(
      groupBy(Object.values(latest), "assetVersionName"),
      (rows): RefDistribution => ({
        low: sumBy(rows, "cvePurlLowCvss"),
        medium: sumBy(rows, "cvePurlMediumCvss"),
        high: sumBy(rows, "cvePurlHighCvss"),
        critical: sumBy(rows, "cvePurlCriticalCvss"),
      }),
    );
  }, [riskHistories]);

  return { distributionByRef, isLoading };
}
