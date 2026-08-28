// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { PostureScope } from "@/services/compliancePostureService";
import { postureBaseUrl } from "@/services/compliancePostureService";
import type { CompliancePostureWithControlDTO } from "@/types/dto";
import type { Paged } from "@/types/view/pagination";

export const useComplianceComponents = () =>
  useApiQuery("/compliance-components/", {});

// Not on the generated client: the list and stats routes take dynamic
// filterQuery[field][op] keys, which OpenAPI cannot express.
export const useCompliancePostures = (
  scope: PostureScope,
  query: URLSearchParams,
) => {
  const base = postureBaseUrl(scope);

  const postures = useSWR<
    Paged<CompliancePostureWithControlDTO> & { frameworks: string[] }
  >(`${base}?${query.toString()}`, fetcher, { keepPreviousData: false });

  const stats = useSWR<{
    open: number;
    implemented: number;
    notApplicable: number;
  }>(`${base}stats/?${query.toString()}`, fetcher);

  return { postures, stats };
};

export const useOrgPolicies = (organization: string) =>
  useApiQuery("/organizations/{organization}/policies", {
    params: { path: { organization } },
  });

export const useAssetVersionCompliance = (scope: {
  organization: string;
  projectSlug: string;
  assetSlug: string;
  assetVersionSlug: string;
}) =>
  useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/compliance",
    { params: { path: scope } },
  );

export const usePolicyEvaluation = (
  scope: {
    organization: string;
    projectSlug: string;
    assetSlug: string;
    assetVersionSlug: string;
  },
  policy: string | undefined,
) =>
  useApiQuery(
    policy
      ? "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/compliance/{policy}"
      : null,
    { params: { path: { ...scope, policy: policy ?? "" } } },
  );
