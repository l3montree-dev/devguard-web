// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { components } from "@/types/api/generated";

export interface AssetScope {
  organization: string;
  projectSlug: string;
  assetSlug: string;
}

export const patchAsset = async (
  scope: AssetScope,
  body: Partial<components["schemas"]["dtos.AssetPatchRequest"]>,
) =>
  unwrap(
    await browserClient.PATCH(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}",
      {
        params: { path: scope },
        body: body as components["schemas"]["dtos.AssetPatchRequest"],
      },
    ),
  );

export const triggerAssetPipeline = async (scope: AssetScope) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/pipeline-trigger/",
      { params: { path: scope } },
    ),
  );

export const removeAssetMember = async (scope: AssetScope, userID: string) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/members/{userID}/",
      { params: { path: { ...scope, userID } } },
    ),
  );

export const changeAssetMemberRole = async (
  scope: AssetScope,
  userID: string,
  role: "admin" | "member",
) =>
  unwrap(
    await browserClient.PUT(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/members/{userID}/",
      { params: { path: { ...scope, userID } }, body: { role } },
    ),
  );

export const deleteAsset = async (scope: AssetScope) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}",
      { params: { path: scope } },
    ),
  );

export const inviteAssetMembers = async (scope: AssetScope, ids: string[]) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/members/",
      { params: { path: scope }, body: { ids } as never },
    ),
  );
