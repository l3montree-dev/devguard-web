// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { OrganizationDTO } from "@/types/dto";
import { uniqBy } from "lodash";
import { getServerClientInAppRouter } from "../services/devGuardApiAppRouter";
import { HttpError } from "./httpError";

export async function fetchOrgs() {
  const client = await getServerClientInAppRouter();

  const [orgs, synced] = await Promise.all([
    client.GET("/organizations"),
    client.GET("/trigger-sync"),
  ]);
  const r = orgs.response;
  const orgsAfterTrigger = synced.response;

  if (!r.ok) {
    throw new HttpError("An unexpected error occurred", {
      statusCode: r.status,
    });
  }
  // parse the organization
  // GET /organizations is annotated with models.Org, not dtos.OrgDTO
  let organizations = orgs.data as unknown as OrganizationDTO[];

  if (orgsAfterTrigger.ok) {
    const orgsAfterTriggerJson = synced.data as unknown as OrganizationDTO[];
    // merge the two org lists, avoiding duplicates
    organizations = uniqBy(organizations.concat(orgsAfterTriggerJson), "slug");
  }
  // sort the orgs by name
  organizations.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return organizations;
}
