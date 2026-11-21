// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type {
  ComplianceScope,
  PostureScope,
} from "@/services/compliancePostureService";
import {
  complianceScopeBaseUrl,
  postureBaseUrl,
} from "@/services/compliancePostureService";
import type {
  ComplianceComponentDetailsDTO,
  CompliancePostureWithControlDTO,
} from "@/types/dto";
import type { Paged } from "@/types/view/pagination";

// The compliance components which apply to the scope, including the inherited ones.
export const useComplianceComponents = (scope: ComplianceScope) =>
  useSWR<ComplianceComponentDetailsDTO[]>(
    `${complianceScopeBaseUrl(scope)}compliance-components/`,
    fetcher,
  );

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
