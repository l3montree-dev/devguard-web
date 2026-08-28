// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { NextRequest, NextResponse } from "next/server";
import { streamFromApi } from "@/services/serverApiClient";

export async function GET(request: NextRequest, ctx: any) {
  try {
    const { organizationSlug, projectSlug, assetSlug } = await ctx.params;

    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/in-toto/root.layout.json";

    const rootLayout = await streamFromApi(uri);

    if (!rootLayout.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch root.layout",
          error: rootLayout.statusText,
        },
        { status: rootLayout.status },
      );
    }

    // Create a response with the JSON stream
    const response = new NextResponse(rootLayout.body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 },
    );
  }
}
