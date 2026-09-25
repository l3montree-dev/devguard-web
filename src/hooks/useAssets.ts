// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useApiQuery } from "@/hooks/useApiQuery";
import type { ProjectScope } from "@/services/projectService";

export const useAssets = (scope: ProjectScope) =>
  useApiQuery("/organizations/{organization}/projects/{projectSlug}/assets", {
    params: { path: scope },
  });
