// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { getApiClientInAppRouter } from "../services/devGuardApiAppRouter";
import { HttpError } from "./httpError";

export async function fetchContentTree(organizationSlug: string) {
  // get the devGuardApiClient
  const devGuardApiClient = await getApiClientInAppRouter();
  // check if there is a slug in the query

  if (organizationSlug) {
    // get the organization
    const contentTree = await devGuardApiClient(
      "/organizations/" +
        decodeURIComponent(organizationSlug) +
        "/content-tree",
    );

    if (!contentTree.ok) {
      if (contentTree.status === 402) {
        throw new HttpError("Payment Required", { statusCode: 402 });
      }
      throw new HttpError("An unexpected error occurred", {
        statusCode: contentTree.status,
      });
    }

    const contentTreeData = await contentTree.json();

    return contentTreeData;
  } else {
    return null;
  }
}
