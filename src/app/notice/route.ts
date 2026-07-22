import { NextResponse } from "next/server";

const ISSUE_URL = `https://api.github.com/repos/l3montree-dev/devguard/issues/2622`;

export async function GET() {
  try {
    const res = await fetch(ISSUE_URL, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 900 },
    });
    if (!res.ok) {
      console.error(res);
      return NextResponse.json({ notice: null }, { status: 200 });
    }

    const issue = await res.json();

    return NextResponse.json({
      notice: {
        title: issue.title,
        updatedAt: issue.updated_at,
        description: issue.body,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ notice: null }, { status: 200 });
  }
}
