// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type { AssetScope } from "@/services/vexRuleService";
import type { ExternalReference } from "@/types/dto";
import type { Paged } from "@/types/view/pagination";
import type { VexRule } from "@/types/view/vexRules";

// Not on the generated client: the list takes dynamic filterQuery[field][op]
// keys, which OpenAPI cannot express.
export const useVexRules = (scope: AssetScope, query: URLSearchParams) =>
  useSWR<Paged<VexRule>>(
    `/organizations/${scope.organization}/projects/${scope.projectSlug}/assets/${scope.assetSlug}/vex-rules/?${query.toString()}`,
    fetcher,
  );

// Not on the generated client either: the sources list takes the same dynamic
// filterQuery keys. Type "unknown" references are already excluded by the API.
export const useVexSources = (scope: AssetScope, query: URLSearchParams) =>
  useSWR<Paged<ExternalReference>>(
    `/organizations/${scope.organization}/projects/${scope.projectSlug}/assets/${scope.assetSlug}/external-references/?${query.toString()}`,
    fetcher,
  );
