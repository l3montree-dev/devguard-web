// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { components } from "@/types/api/generated";

export interface AssetScope {
  organization: string;
  projectSlug: string;
  assetSlug: string;
}

const VEX_RULES =
  "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/vex-rules" as const;

export type CreateVexRuleRequest =
  components["schemas"]["dtos.CreateVEXRuleRequest"];
export type TestVexRulesRequest =
  components["schemas"]["dtos.TestVEXRulesRequest"];

export const createVexRule = async (
  scope: AssetScope,
  body: CreateVexRuleRequest,
) =>
  unwrap(
    await browserClient.POST(VEX_RULES, { params: { path: scope }, body }),
  );

export const deleteVexRule = async (scope: AssetScope, ruleId: string) =>
  unwrap(
    await browserClient.DELETE(`${VEX_RULES}/{ruleId}`, {
      params: { path: { ...scope, ruleId } },
    }),
  );

export const testVexRules = async (
  scope: AssetScope,
  body: TestVexRulesRequest,
) =>
  unwrap(
    await browserClient.POST(`${VEX_RULES}/test`, {
      params: { path: scope },
      body,
    }),
  );
