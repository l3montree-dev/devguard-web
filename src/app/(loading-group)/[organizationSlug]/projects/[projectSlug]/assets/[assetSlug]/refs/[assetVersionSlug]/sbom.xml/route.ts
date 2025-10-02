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
      "/sbom.xml/";

    const sbom = await apiClient(uri);

    if (!sbom.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch sbom",
          error: sbom.statusText,
        },
        { status: sbom.status },
      );
    }

    // Create a response with the XML stream
    const response = new NextResponse(sbom.body, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
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
