import { NextRequest, NextResponse } from "next/server";
import { getApiClientFromRequest } from "@/services/devGuardApi";
import { cookies } from "next/headers";

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

    // Get cookies for authentication
    const cookieStore = await cookies();
    const apiClient = getApiClientFromRequest({
      cookies: Object.fromEntries(
        cookieStore.getAll().map((c) => [c.name, c.value]),
      ),
    });

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
      "/vex.json/";

    const vex = await apiClient(uri);

    if (!vex.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch vex",
          error: vex.statusText,
        },
        { status: vex.status },
      );
    }

    // Create a response with the JSON stream
    const response = new NextResponse(vex.body, {
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
