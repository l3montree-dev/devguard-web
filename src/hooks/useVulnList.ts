// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type { AssetVersionScope } from "@/hooks/useAssetVersionStats";
import type { Paged } from "@/types/view/pagination";

// Not on the generated client: the lists take dynamic filterQuery[field][op]
// keys, which OpenAPI cannot express.
const useVulnPage = <T>(
  scope: AssetVersionScope,
  resource: string,
  query: URLSearchParams,
) =>
  useSWR<Paged<T>>(
    `/organizations/${scope.organization}/projects/${scope.projectSlug}/assets/${scope.assetSlug}/refs/${scope.assetVersionSlug}/${resource}/?${query.toString()}`,
    fetcher,
    { keepPreviousData: true },
  );

export const useDependencyVulnList = <T>(
  scope: AssetVersionScope,
  query: URLSearchParams,
) => useVulnPage<T>(scope, "dependency-vulns", query);

export const useFirstPartyVulnList = <T>(
  scope: AssetVersionScope,
  query: URLSearchParams,
) => useVulnPage<T>(scope, "first-party-vulns", query);

export const useLicenseRiskList = <T>(
  scope: AssetVersionScope,
  query: URLSearchParams,
) => useVulnPage<T>(scope, "license-risks", query);
