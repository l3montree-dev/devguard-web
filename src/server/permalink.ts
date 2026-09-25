// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// Shared handler behind the /api/-/{o,p,a}/<uuid> permalinks: resolve a UUID to
// its slug based URL via the backend and redirect there. Lets us hand out
// stable links (mails, issues, webhooks) without knowing the slugs upfront.

import { config as appConfig } from "@/config";
import type { NextApiRequest, NextApiResponse } from "next";

// the query parameter /api/v1/resolve/ expects for each entity level
export type PermalinkQueryParam = "orgId" | "projectId" | "assetId";

interface Resolved {
  organizationSlug: string;
  projectSlug?: string;
  assetSlug?: string;
}

export const createPermalinkHandler =
  (queryParam: PermalinkQueryParam) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).end();
    }

    // catch all route: the first segment is the uuid, the rest is the deep link
    // into the entity we are about to resolve
    const segments = req.query.path;
    const [id, ...rest] = Array.isArray(segments)
      ? segments
      : [segments].filter((s): s is string => Boolean(s));

    if (!id) {
      return res.redirect(302, "/?error=not-found");
    }

    const resp = await fetch(
      `${appConfig.devGuardApiUrl}/api/v1/resolve/?${queryParam}=${encodeURIComponent(id)}`,
      { headers: { Cookie: req.headers.cookie ?? "" }, credentials: "include" },
    );

    // send the user through login and back to this permalink afterwards
    if (resp.status === 401) {
      return res.redirect(
        302,
        `/login?return_to=${encodeURIComponent(req.url!)}`,
      );
    }

    if (!resp.ok) {
      return res.redirect(302, "/?error=not-found");
    }

    // the backend omits the levels that do not apply, so the target is simply
    // whichever slugs came back
    const { organizationSlug, projectSlug, assetSlug } =
      (await resp.json()) as Resolved;

    const path = [
      organizationSlug,
      projectSlug && `projects/${projectSlug}`,
      assetSlug && `assets/${assetSlug}`,
      ...rest.map(encodeURIComponent),
    ]
      .filter(Boolean)
      .join("/");

    const query = req.url?.includes("?")
      ? req.url.slice(req.url.indexOf("?"))
      : "";

    return res.redirect(302, `/${path}${query}`);
  };
