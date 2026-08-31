// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { components } from "@/types/api/generated";

type GeneratedProjectCreate =
  components["schemas"]["dtos.ProjectCreateRequest"];

// only name carries validate:"required" in Go; parentId is a pointer and type
// defaults server side
export type ProjectCreateRequest = Pick<GeneratedProjectCreate, "name"> &
  Partial<GeneratedProjectCreate>;

export interface ProjectScope {
  organization: string;
  projectSlug: string;
}

export const createProject = async (
  organization: string,
  body: ProjectCreateRequest,
) =>
  unwrap(
    await browserClient.POST("/organizations/{organization}/projects", {
      params: { path: { organization } },
      body: body as GeneratedProjectCreate,
    }),
  );

export const patchProject = async (
  scope: ProjectScope,
  body: Partial<components["schemas"]["dtos.ProjectPatchRequest"]>,
) =>
  unwrap(
    await browserClient.PATCH(
      "/organizations/{organization}/projects/{projectSlug}",
      {
        params: { path: scope },
        // a PATCH body is partial by definition; the Go struct uses pointers
        body: body as components["schemas"]["dtos.ProjectPatchRequest"],
      },
    ),
  );

export const deleteProject = async (scope: ProjectScope) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/projects/{projectSlug}",
      { params: { path: scope } },
    ),
  );

export const createAsset = async (
  scope: ProjectScope,
  body: components["schemas"]["dtos.AssetCreateRequest"],
) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/projects/{projectSlug}/assets",
      { params: { path: scope }, body },
    ),
  );

export const changeProjectMemberRole = async (
  scope: ProjectScope,
  userID: string,
  role: "admin" | "member",
) =>
  unwrap(
    await browserClient.PUT(
      "/organizations/{organization}/projects/{projectSlug}/members/{userID}/",
      { params: { path: { ...scope, userID } }, body: { role } },
    ),
  );

export const removeProjectMember = async (
  scope: ProjectScope,
  userID: string,
) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/projects/{projectSlug}/members/{userID}/",
      { params: { path: { ...scope, userID } } },
    ),
  );

export const listProjectResources = async (
  scope: ProjectScope,
  parentId: string,
) =>
  unwrap(
    await browserClient.GET(
      "/organizations/{organization}/projects/{projectSlug}/resources",
      { params: { path: scope, query: { parentId } } },
    ),
  );

export const inviteProjectMembers = async (
  scope: ProjectScope,
  ids: string[],
) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/projects/{projectSlug}/members",
      { params: { path: scope }, body: { ids } as never },
    ),
  );
