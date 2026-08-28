// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { FetcherError, fetcher } from "@/data-fetcher/fetcher";
import { browserApiClient } from "@/services/devGuardApi";
import type {
  DependencyVuln,
  Paged,
  VexRuleRecommendation,
} from "@/types/api/api";
import useSWR from "swr";

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

/** Looks up the recommendation matching a vuln in a signature index built by
 * indexVexRuleRecommendationsBySignature, or undefined if there is none. */
export function findRecommendationForVuln(
  bySignature: Map<string, VexRuleRecommendation>,
  vuln: Pick<DependencyVuln, "signature" | "assetSignature">,
): VexRuleRecommendation | undefined {
  return (
    bySignature.get(vuln.signature) ?? bySignature.get(vuln.assetSignature)
  );
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
