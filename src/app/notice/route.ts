import { NextResponse } from "next/server";

const ISSUE_URL = `https://api.github.com/repos/l3montree-dev/devguard/issues/2622`;

// Extract Metadata for Announcements
function parseNotice(body: string): {
  showFrom: string | null;
  showUntil: string | null;
  content: string;
} {
  const COMMENT = /<!--\s*notice:(.*?)-->/s;
  const match = body.match(COMMENT);

  if (!match) {
    return { showFrom: null, showUntil: null, content: body.trim() };
  }

  const meta = match[1];
  const showFrom = meta.match(/showFrom=(\S+)/)?.[1] ?? null;
  const showUntil = meta.match(/showUntil=(\S+)/)?.[1] ?? null;

  const content = body.replace(COMMENT, "").trim();

  return { showFrom, showUntil, content };
}

function parseDate(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? null : ts;
}

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
    const {
      showFrom: rawFrom,
      showUntil: rawUntil,
      content,
    } = parseNotice(issue.body ?? "");

    const now = Date.now();
    const showFrom = parseDate(rawFrom);
    const showUntil = parseDate(rawUntil);

    if (showFrom !== null && now < showFrom)
      return NextResponse.json({ notice: null });
    if (showUntil !== null && now > showUntil)
      return NextResponse.json({ notice: null });

    return NextResponse.json({
      notice: {
        title: issue.title,
        updatedAt: issue.updated_at,
        description: content,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ notice: null }, { status: 200 });
  }
}
