// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useApiQuery } from "@/hooks/useApiQuery";
import type { ProjectScope } from "@/services/projectService";

const RELEASE_STATS =
  "/organizations/{organization}/projects/{projectSlug}/releases/{releaseID}/stats";

export const useReleaseRiskHistory = (
  scope: ProjectScope,
  releaseID: string | undefined,
  start: string,
  end: string,
) =>
  useApiQuery(releaseID ? `${RELEASE_STATS}/risk-history/` : null, {
    params: {
      path: { ...scope, releaseID: releaseID ?? "" },
      query: { start, end },
    },
  });

export const useReleaseAverageFixingTime = (
  scope: ProjectScope,
  releaseID: string | undefined,
) =>
  useApiQuery(releaseID ? `${RELEASE_STATS}/average-fixing-time/` : null, {
    params: { path: { ...scope, releaseID: releaseID ?? "" } },
  });
