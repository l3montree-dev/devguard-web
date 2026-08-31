// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWRImmutable from "swr/immutable";

// Documentation pages are fetched straight from the docs repository, not from
// the DevGuard API, and never change within a session.
const stripMdx = (text: string) =>
  text
    // strip frontmatter
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    // strip import statements (including multiline)
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]*['"];?\n/gm, "")
    // remove tooltip/popover content blocks entirely (hidden tooltip text)
    .replace(/<TooltipContent[^>]*>[\s\S]*?<\/TooltipContent>/g, "")
    .replace(/<PopoverContent[^>]*>[\s\S]*?<\/PopoverContent>/g, "")
    // strip all remaining JSX component tags (PascalCase), keep inner content
    .replace(/<\/?[A-Z][a-zA-Z]*(?:\s[^>]*)?\s*\/?>/g, "")
    // strip plain span tags (keep text content)
    .replace(/<\/?span[^>]*>/g, "")
    // remove className and other JSX props from plain HTML tags
    .replace(/\s+className="[^"]*"/g, "")
    // collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n");

export const useMdxDoc = (mdxUrl: string | null) => {
  const { data, error } = useSWRImmutable(mdxUrl, async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    return stripMdx(await response.text());
  });

  return { content: data ?? null, error: Boolean(error) };
};
