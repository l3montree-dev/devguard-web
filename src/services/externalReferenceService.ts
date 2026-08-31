// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { AssetScope } from "@/services/vexRuleService";
import type { components } from "@/types/api/generated";

const EXTERNAL_REFERENCES =
  "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/external-references" as const;

export type CreateExternalReferenceRequest =
  components["schemas"]["dtos.CreateExternalReferenceRequest"];

export const createExternalReference = async (
  scope: AssetScope,
  body: CreateExternalReferenceRequest,
) =>
  unwrap(
    await browserClient.POST(EXTERNAL_REFERENCES, {
      params: { path: scope },
      body,
    }),
  );

export const deleteExternalReference = async (scope: AssetScope, url: string) =>
  unwrap(
    await browserClient.DELETE(`${EXTERNAL_REFERENCES}/{url}`, {
      params: { path: { ...scope, url } },
    }),
  );

export const syncExternalReferences = async (scope: AssetScope) =>
  unwrap(
    await browserClient.POST(`${EXTERNAL_REFERENCES}/sync`, {
      params: { path: scope },
    }),
  );
