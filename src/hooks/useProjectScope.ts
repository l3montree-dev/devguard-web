// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ProjectScope } from "@/services/projectService";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveProject } from "./useActiveProject";

export const useProjectScope = (): ProjectScope => ({
  organization: useActiveOrg().slug,
  projectSlug: useActiveProject()!.slug,
});
