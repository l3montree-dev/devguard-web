// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { adminClient, unwrap } from "@/services/apiClient";
import type { InstanceOverview } from "@/types/dto";
import type {
  ExternalOrg,
  InstanceUsageStatistics,
  OrgAdmin,
} from "@/types/view/admin";

/** Confirms the signing key is accepted, so the admin UI can unlock. */
export const verifyAdminKey = async (key: CryptoKey) =>
  unwrap(await adminClient(key).GET("/admin"));

export const fetchExternalOrgs = async (
  key: CryptoKey,
): Promise<ExternalOrg[]> =>
  unwrap(await adminClient(key).GET("/admin/external-orgs/")) as ExternalOrg[];

export const fetchInstanceStatistics = async (key: CryptoKey) => {
  const client = adminClient(key);
  const [usage, vulnerabilities] = await Promise.all([
    client.GET("/admin/statistics/usage/"),
    client.GET("/admin/statistics/vulnerabilities/"),
  ]);

  return {
    // dtos.InstanceUsageStatistics has no json tags, so it generates as an
    // empty object - see the note on the view type.
    usage: unwrap(usage) as unknown as InstanceUsageStatistics,
    overview: unwrap(vulnerabilities) as InstanceOverview,
  };
};

// The spec declares 201 with no body, but the handler does return the created
// admin, so take it when it is there.
export const assignOrgAdmin = async (
  key: CryptoKey,
  orgID: string,
  userMail: string,
): Promise<Partial<OrgAdmin> | undefined> =>
  unwrap(
    await adminClient(key).PUT(
      "/admin/external-orgs/{orgID}/admins/{userMail}/",
      { params: { path: { orgID, userMail } } },
    ),
  ) as Partial<OrgAdmin> | undefined;

export const revokeOrgAdmin = async (
  key: CryptoKey,
  orgID: string,
  userID: string,
) =>
  unwrap(
    await adminClient(key).DELETE(
      "/admin/external-orgs/{orgID}/admins/{userID}/",
      { params: { path: { orgID, userID } } },
    ),
  );

export const patchInstanceSettings = async (
  key: CryptoKey,
  disableOrgCreation: boolean,
) =>
  unwrap(
    await adminClient(key).PATCH("/admin/settings/", {
      body: { disable_org_creation: disableOrgCreation },
    }),
  );
