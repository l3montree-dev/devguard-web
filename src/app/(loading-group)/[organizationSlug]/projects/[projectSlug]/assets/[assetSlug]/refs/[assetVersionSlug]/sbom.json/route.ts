// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { streamFromApi } from "@/services/streamingClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, ctx: any) {
  try {
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      await ctx.params;

    // Get search params for artifact query parameter
    const searchParams = request.nextUrl.searchParams;
    const artifact = searchParams.get("artifact");

    if (!artifact) {
      return NextResponse.json(
        { message: "Artifact parameter is required" },
        { status: 400 },
      );
    }

    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/artifacts/" +
      encodeURIComponent(artifact) +
      "/sbom.json/";

    const sbom = await streamFromApi(uri);

    if (!sbom.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch sbom",
          error: sbom.statusText,
        },
        { status: sbom.status },
      );
    }

    // Create a response with the JSON stream
    const response = new NextResponse(sbom.body, {
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
