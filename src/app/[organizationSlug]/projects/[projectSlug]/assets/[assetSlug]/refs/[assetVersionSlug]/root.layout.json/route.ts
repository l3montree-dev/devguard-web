import { NextRequest, NextResponse } from "next/server";
import { getApiClientFromRequest } from "@/services/devGuardApi";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };
  },
) {
  try {
    const { organizationSlug, projectSlug, assetSlug } = params;

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
      "/in-toto/root.layout.json";

    const rootLayout = await apiClient(uri);

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
