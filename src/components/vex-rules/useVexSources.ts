// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { fetcher } from "@/data-fetcher/fetcher";
import useDecodedParams from "@/hooks/useDecodedParams";
import type { ExternalReference } from "@/types/api/api";
import type { VexSource, VexSourceType } from "@/types/view/vexRules";
import useSWR from "swr";

export const SOURCE_TYPE_LABEL: Record<VexSourceType, string> = {
  cyclonedx: "CycloneDX VEX",
  csaf: "CSAF",
};

const isVexSourceType = (type: string): type is VexSourceType =>
  type === "cyclonedx" || type === "csaf";

/**
 * The upstream VEX/CSAF references of this repository; other external reference
 * types are filtered out. Callers share one request, deduped by SWR.
 */
export function useVexSources() {
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };

  const apiUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/external-references`;
  const { data, error, mutate, isLoading } = useSWR<ExternalReference[]>(
    apiUrl,
    fetcher,
  );

  const sources = (data ?? []).filter((ref): ref is VexSource =>
    isVexSourceType(ref.type),
  );

  return { sources, apiUrl, error, isLoading, mutate };
}
