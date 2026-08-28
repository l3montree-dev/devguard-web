// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import { useApiQuery } from "@/hooks/useApiQuery";

import type { Paged } from "@/types/view/pagination";
import type { VulnEventDTO } from "@/types/view/vulnEvents";
import type { RiskHistory } from "@/types/dto";

export interface AssetVersionScope {
  organization: string;
  projectSlug: string;
  assetSlug: string;
  assetVersionSlug: string;
}

// The generated event type is flat; the frontend models events as a
// discriminated union so arbitraryJSONData is typed per event kind.
export const useAssetVersionEvents = (
  scope: AssetVersionScope,
  pageSize: number,
) => {
  const { data, isLoading } = useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/events",
    { params: { path: scope, query: { pageSize } } },
  );
  return { data: data as unknown as Paged<VulnEventDTO>, isLoading };
};

export const useComponentRisk = (
  scope: AssetVersionScope,
  artifactName?: string,
) =>
  useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/stats/component-risk/",
    { params: { path: scope, query: { artifactName } } },
  );

export const useRiskHistory = (
  scope: AssetVersionScope,
  start: string,
  end: string,
  artifactName?: string,
) => {
  const { data, isLoading } = useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/stats/risk-history/",
    { params: { path: scope, query: { start, end, artifactName } } },
  );
  return { data: data as unknown as RiskHistory[], isLoading };
};

export const useAverageFixingTime = (
  scope: AssetVersionScope,
  artifactName?: string,
) =>
  useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/stats/average-fixing-time/",
    { params: { path: scope, query: { artifactName } } },
  );

// the handler reads the artifact from `artifact`, not `artifactName`
export const useComponentLicenses = (
  scope: AssetVersionScope,
  artifact?: string,
) =>
  useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/components/licenses",
    { params: { path: scope, query: { artifact } } },
  );

// Not on the generated client: the paged events list takes arbitrary query
// state straight from the URL.
export const useVulnEventsPage = (
  scope: Omit<AssetVersionScope, "assetVersionSlug"> & {
    assetVersionSlug?: string;
  },
  query: string,
) => {
  const base = `/organizations/${scope.organization}/projects/${scope.projectSlug}/assets/${scope.assetSlug}`;
  const ref = scope.assetVersionSlug ? `/refs/${scope.assetVersionSlug}` : "";
  return useSWR<Paged<VulnEventDTO>>(`${base}${ref}/events/?${query}`, fetcher);
};
