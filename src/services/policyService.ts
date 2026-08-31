// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { components } from "@/types/api/generated";

type PolicyBody = components["schemas"]["dtos.PolicyDTO"];

export const createPolicy = async (organization: string, policy: PolicyBody) =>
  unwrap(
    await browserClient.POST("/organizations/{organization}/policies", {
      params: { path: { organization } },
      body: policy,
    }),
  );

export const updatePolicy = async (
  organization: string,
  policyID: string,
  policy: PolicyBody,
) =>
  unwrap(
    await browserClient.PUT(
      "/organizations/{organization}/policies/{policyID}",
      {
        params: { path: { organization, policyID } },
        body: policy,
      },
    ),
  );

export const deletePolicy = async (organization: string, policyID: string) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/policies/{policyID}",
      { params: { path: { organization, policyID } } },
    ),
  );

export const enableProjectPolicy = async (
  organization: string,
  projectSlug: string,
  policyID: string,
) =>
  unwrap(
    await browserClient.PUT(
      "/organizations/{organization}/projects/{projectSlug}/policies/{policyID}",
      { params: { path: { organization, projectSlug, policyID } } },
    ),
  );

export const disableProjectPolicy = async (
  organization: string,
  projectSlug: string,
  policyID: string,
) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/projects/{projectSlug}/policies/{policyID}",
      { params: { path: { organization, projectSlug, policyID } } },
    ),
  );
