// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { streamFromApi } from "@/services/streamingClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, ctx: any) {
  try {
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      await ctx.params;

    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/sarif.json/";

    const sarif = await streamFromApi(uri);

    if (!sarif.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch sarif",
          error: sarif.statusText,
        },
        { status: sarif.status },
      );
    }

    // Create a response with the JSON stream
    const response = new NextResponse(sarif.body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${assetSlug}_sarif.json"`,
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
