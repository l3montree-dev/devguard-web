// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ComponentPaged, ProjectDependency } from "@/types/view/component";
import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type { AssetVersionScope } from "@/hooks/useAssetVersionStats";
import { useApiQuery } from "@/hooks/useApiQuery";

import type { Paged } from "@/types/view/pagination";

// Not on the generated client: the list takes dynamic filterQuery[field][op]
// keys, which OpenAPI cannot express.
export const useComponentList = (
  scope: AssetVersionScope,
  query: URLSearchParams,
) =>
  useSWR<Paged<ComponentPaged>>(
    `/organizations/${scope.organization}/projects/${scope.projectSlug}/assets/${scope.assetSlug}/refs/${scope.assetVersionSlug}/components?${query.toString()}`,
    fetcher,
    { keepPreviousData: true },
  );

export const useAffectedComponents = (scope: AssetVersionScope) =>
  useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/affected-components/",
    { params: { path: scope } },
  );

// `all` is applied client side, so it deliberately stays out of the request.
export const useDependencyGraphData = (
  scope: AssetVersionScope,
  artifactName?: string,
  origin?: string,
) =>
  useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/dependency-graph/",
    { params: { path: scope, query: { artifactName, origin } } },
    { revalidateOnFocus: false, revalidateIfStale: false },
  );

export const usePurlInspect = (purl: string | undefined) =>
  useApiQuery(
    purl ? "/vulndb/purl-inspect/{purl}" : null,
    { params: { path: { purl: purl ?? "" } } },
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  );

// Not on the generated client: the project wide dependency list takes dynamic
// filterQuery[field][op] keys, which OpenAPI cannot express.
export const useProjectComponentList = (
  scope: { organization: string; projectSlug: string },
  query: URLSearchParams,
) =>
  useSWR<Paged<ProjectDependency>>(
    `/organizations/${scope.organization}/projects/${scope.projectSlug}/components?${query.toString()}`,
    fetcher,
  );
