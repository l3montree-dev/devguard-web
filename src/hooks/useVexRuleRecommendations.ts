// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/data-fetcher/fetcher";
import { apiFetch, ApiError } from "@/services/apiClient";
import type { Paged } from "@/types/view/pagination";
import type {
  VexRulePrefill,
  VexRuleRecommendation,
} from "@/types/view/vexRules";
import { useCurrentUserRole, isMember } from "./useUserRole";
import useDecodedParams from "./useDecodedParams";

export default function useVexRuleRecommendations(
  recommendationsQuery?: URLSearchParams | null,
) {
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };
  const [rulePrefill, setRulePrefill] = useState<VexRulePrefill>();
  const [addRuleDialogOpen, setAddRuleDialogOpen] = useState(false);
  const currentUserRole = useCurrentUserRole();
  const canSeeRecommendations = isMember(currentUserRole);
  const recommendationsUrl = vexRuleRecommendationsURL({
    organizationSlug,
    projectSlug,
    assetSlug,
  });
  const { data: recommendationsResponse, isLoading: isRecommendationsLoading } =
    useSWR<Paged<VexRuleRecommendation>>(
      canSeeRecommendations
        ? `${recommendationsUrl}/?${recommendationsQuery?.toString()}`
        : null,
      fetcher,
    );

  const createRuleFromRecommendation = (
    recommendation: VexRuleRecommendation,
  ) => {
    setRulePrefill({
      celExpression: recommendation.celExpression,
      justification: recommendation.justification,
      mechanicalJustification: recommendation.mechanicalJustification,
      wasRecommended: true,
      title: recommendation.title,
    });
    setAddRuleDialogOpen(true);
  };

  return {
    rulePrefill,
    setRulePrefill,
    addRuleDialogOpen,
    setAddRuleDialogOpen,
    recommendationsResponse,
    isRecommendationsLoading,
    createRuleFromRecommendation,
    canSeeRecommendations,
  };
}

export function vexRuleRecommendationsURL(params: {
  organizationSlug: string;
  projectSlug: string;
  assetSlug: string;
}): string {
  const { organizationSlug, projectSlug, assetSlug } = params;
  return `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/vex-rules/recommendations`;
}

// "No recommendation" is a 204 with no body, which the shared fetcher can't parse.
const recommendationFetcher = async <T>(url: string): Promise<T | null> => {
  const resp = await apiFetch(url);
  if (resp.status === 204) return null;
  if (!resp.ok) {
    throw new ApiError(
      "An error occurred while fetching VEX rule recommendations.",
      resp.status,
    );
  }
  return resp.json();
};

/** The recommendation for a single vulnerability, or null if there is none. */
export function useVexRuleRecommendation(
  baseUrl: string | null,
  vulnID: string | undefined,
) {
  const { data, error, isLoading } = useSWR<VexRuleRecommendation | null>(
    baseUrl && vulnID ? `${baseUrl}/${vulnID}/` : null,
    recommendationFetcher,
  );

  return { recommendation: data ?? null, error, isLoading };
}
