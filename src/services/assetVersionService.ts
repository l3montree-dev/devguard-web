// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { AssetScope } from "@/services/assetService";

const REFS =
  "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/" as const;

export const createAssetVersion = async (
  scope: AssetScope,
  body: { name: string; tag: boolean; defaultBranch: boolean },
) => unwrap(await browserClient.POST(REFS, { params: { path: scope }, body }));

export const deleteAssetVersion = async (
  scope: AssetScope,
  assetVersionSlug: string,
) =>
  unwrap(
    await browserClient.DELETE(`${REFS}{assetVersionSlug}/`, {
      params: { path: { ...scope, assetVersionSlug } },
    }),
  );

export const makeAssetVersionDefault = async (
  scope: AssetScope,
  assetVersionSlug: string,
) =>
  unwrap(
    await browserClient.POST(`${REFS}{assetVersionSlug}/make-default/`, {
      params: { path: { ...scope, assetVersionSlug } },
    }),
  );
