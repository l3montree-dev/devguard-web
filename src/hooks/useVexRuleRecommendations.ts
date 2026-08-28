// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useState } from "react";
import useSWR from "swr";
import { FetcherError, fetcher } from "@/data-fetcher/fetcher";
import { browserApiClient } from "@/services/devGuardApi";
import type { DependencyVuln } from "@/types/dto";
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
  const resp = await browserApiClient(url);
  if (resp.status === 204) return null;
  if (!resp.ok) {
    throw new FetcherError(
      "An error occurred while fetching VEX rule recommendations.",
      resp.status,
    );
  }
  return resp.json();
};

/** @lintignore - scaffolding for VEX recommendations on risk rows; not wired up yet. */
export function indexVexRuleRecommendationsBySignature(
  recommendations: VexRuleRecommendation[],
): Map<string, VexRuleRecommendation> {
  const bySignature = new Map<string, VexRuleRecommendation>();
  for (const recommendation of recommendations) {
    const signature =
      recommendation.dependencyVulnSignature ?? recommendation.assetSignature;
    if (signature) {
      bySignature.set(signature, recommendation);
    }
  }
  return bySignature;
}

/** Looks up the recommendation matching a vuln in a signature index built by
 * indexVexRuleRecommendationsBySignature, or undefined if there is none.
 * @lintignore - scaffolding for VEX recommendations on risk rows; not wired up yet. */
export function findRecommendationForVuln(
  bySignature: Map<string, VexRuleRecommendation>,
  vuln: Pick<DependencyVuln, "signature" | "assetSignature">,
): VexRuleRecommendation | undefined {
  return (
    bySignature.get(vuln.signature) ?? bySignature.get(vuln.assetSignature)
  );
}

const ALL_RECOMMENDATIONS_PAGE_SIZE = "10000";

/** All VEX rule recommendations for an asset, unpaginated.
 * @lintignore - scaffolding for VEX recommendations on risk rows; not wired up yet. */
export function useAllVexRuleRecommendations(
  params: {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  } | null,
) {
  const url = params ? vexRuleRecommendationsURL(params) : null;
  const { data, error, isLoading } = useSWR<Paged<VexRuleRecommendation>>(
    url
      ? `${url}/?${new URLSearchParams({
          page: "1",
          pageSize: ALL_RECOMMENDATIONS_PAGE_SIZE,
        }).toString()}`
      : null,
    fetcher,
  );

  return {
    data,
    error,
    isLoading,
  };
}

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
