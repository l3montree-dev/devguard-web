// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetDTO, ProjectDetailsDTO } from "@/types/dto";

import { getServerClient } from "@/services/serverApiClient";
import { HttpError } from "./httpError";

export async function fetchProject(
  organizationSlug: string,
  projectSlug: string,
) {
  const client = await getServerClient();

  const { data, response: r } = await client.GET(
    "/organizations/{organization}/projects/{projectSlug}",
    {
      params: {
        path: {
          organization: decodeURIComponent(organizationSlug),
          projectSlug,
        },
      },
    },
  );

  if (!r.ok) {
    throw new HttpError("Could not fetch group", {
      statusCode: r.status,
      title: "Failed to load group",
      description: `An error occurred while fetching the group. Please try again later. (${r.status} ${r.statusText})`,
      homeLink: `/${organizationSlug}`, // link to the project list
    });
  }
  return data as ProjectDetailsDTO & { assets: Array<AssetDTO> };
}
