// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { OrganizationDTO } from "@/types/api/api";
import { uniqBy } from "lodash";
import { getApiClientInAppRouter } from "../services/devGuardApiAppRouter";
import { HttpError } from "./http-error";

export async function fetchOrgs() {
  // get the devGuardApiClient
  const devGuardApiClient = await getApiClientInAppRouter();

  // get the organization
  const [r, orgsAfterTrigger] = await Promise.all([
    devGuardApiClient("/organizations/"),
    devGuardApiClient("/trigger-sync", {
      method: "GET",
    }),
  ]);

  if (!r.ok) {
    throw new HttpError("An unexpected error occurred", {
      statusCode: r.status,
    });
  }
  // parse the organization
  let organizations: OrganizationDTO[] = await r.json();

  if (orgsAfterTrigger.ok) {
    const orgsAfterTriggerJson: OrganizationDTO[] =
      await orgsAfterTrigger.json();
    // merge the two org lists, avoiding duplicates
    organizations = uniqBy(organizations.concat(orgsAfterTriggerJson), "slug");
  }
  // sort the orgs by name
  organizations.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return organizations;
}
