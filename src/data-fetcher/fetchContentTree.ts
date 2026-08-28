// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { getServerClient } from "@/services/serverApiClient";
import { HttpError } from "./httpError";

export async function fetchContentTree(organizationSlug: string) {
  // get the devGuardApiClient
  const client = await getServerClient();
  // check if there is a slug in the query

  if (organizationSlug) {
    // get the organization
    const { data, response: contentTree } = await client.GET(
      "/organizations/{organization}/content-tree",
      {
        params: {
          path: { organization: decodeURIComponent(organizationSlug) },
        },
      },
    );

    if (!contentTree.ok) {
      if (contentTree.status === 402) {
        throw new HttpError("Payment Required", { statusCode: 402 });
      }
      throw new HttpError("An unexpected error occurred", {
        statusCode: contentTree.status,
      });
    }

    return data ?? [];
  } else {
    return [];
  }
}
