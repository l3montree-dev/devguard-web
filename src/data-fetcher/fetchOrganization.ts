// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { OrganizationDetailsDTO } from "@/types/dto";
import { getServerClientInAppRouter } from "../services/devGuardApiAppRouter";
import { HttpError } from "./httpError";

export async function fetchOrganization(organizationSlug: string) {
  // get the devGuardApiClient
  const client = await getServerClientInAppRouter();

  if (organizationSlug) {
    // get the organization
    const { data, response: org } = await client.GET(
      "/organizations/{organization}",
      {
        params: {
          path: { organization: decodeURIComponent(organizationSlug) },
        },
      },
    );

    // if the organization slug starts with an @ it is actually an identity provider
    // there has to be a token in the backend - maybe the user just needs to reauthorize.
    if (!org.ok) {
      if (org.status === 402) {
        throw new HttpError("Payment Required", { statusCode: 402 });
      } else if (org.status === 403) {
        throw new HttpError("Forbidden", { statusCode: 403 });
      } else if (org.status === 401) {
        throw new HttpError("Unauthorized", {
          statusCode: 401,
          title: "Page not found",
          description:
            "The page you're looking for doesn't exist or you don't have access. Please log in to continue.",
          homeLink: "/login",
        });
      } else if (org.status === 404) {
        throw new HttpError("Not Found", {
          statusCode: 404,
          title: "Page not found",
          description: "The organization you're looking for doesn't exist.",
          homeLink: "/",
        });
      } else {
        throw new HttpError("An unexpected error occurred", {
          statusCode: org.status,
        });
      }
    }
    // parse the organization
    return data as OrganizationDetailsDTO;
  } else {
    return null;
  }
}
