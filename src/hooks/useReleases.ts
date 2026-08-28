// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useApiQuery } from "@/hooks/useApiQuery";
import type { ProjectScope } from "@/services/projectService";

export const useReleases = (scope: ProjectScope) =>
  useApiQuery("/organizations/{organization}/projects/{projectSlug}/releases", {
    params: { path: scope },
  });

export const useReleaseCandidates = (scope: ProjectScope) =>
  useApiQuery(
    "/organizations/{organization}/projects/{projectSlug}/releases/candidates",
    { params: { path: scope } },
  );

export const useRelease = (
  scope: ProjectScope,
  releaseID: string | undefined,
) =>
  useApiQuery(
    releaseID
      ? "/organizations/{organization}/projects/{projectSlug}/releases/{releaseID}"
      : null,
    { params: { path: { ...scope, releaseID: releaseID ?? "" } } },
  );
