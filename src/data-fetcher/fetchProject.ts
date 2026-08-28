// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetDTO, ProjectDTO } from "@/types/api/api";
import { getApiClientInAppRouter } from "../services/devGuardApiAppRouter";
import { HttpError } from "./httpError";

export async function fetchProject(
  organizationSlug: string,
  projectSlug: string,
) {
  const devGuardApiClient = await getApiClientInAppRouter();

  const url = `/organizations/${decodeURIComponent(organizationSlug)}/projects/${projectSlug}`;
  // console.log(url);
  const r = await devGuardApiClient(url);

  if (!r.ok) {
    throw new HttpError("Could not fetch group", {
      statusCode: r.status,
      title: "Failed to load group",
      description: `An error occurred while fetching the group. Please try again later. (${r.status} ${r.statusText})`,
      homeLink: `/${organizationSlug}`, // link to the project list
    });
  }
  // parse the organization
  const project: ProjectDTO & {
    assets: Array<AssetDTO>;
  } = await r.json();

  return project;
}
