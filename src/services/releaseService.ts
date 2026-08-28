// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { ProjectScope } from "@/services/projectService";
import type { components } from "@/types/api/generated";

const RELEASES =
  "/organizations/{organization}/projects/{projectSlug}/releases" as const;

export type ReleaseCreateRequest =
  components["schemas"]["dtos.ReleaseCreateRequest"];

export const createRelease = async (
  scope: ProjectScope,
  body: ReleaseCreateRequest,
) =>
  unwrap(await browserClient.POST(RELEASES, { params: { path: scope }, body }));

export const deleteRelease = async (scope: ProjectScope, releaseID: string) =>
  unwrap(
    await browserClient.DELETE(`${RELEASES}/{releaseID}`, {
      params: { path: { ...scope, releaseID } },
    }),
  );
