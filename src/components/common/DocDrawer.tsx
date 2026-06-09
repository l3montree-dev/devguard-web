// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Markdown from "./Markdown";

const mdxCache = new Map<string, string>();

export interface DocDrawerProps {
  triggerLabel: string;
  drawerTitle: string;
  mdxUrl: string;
  docsUrl: string;
}

export function DocDrawer({
  triggerLabel,
  drawerTitle,
  mdxUrl,
  docsUrl,
}: DocDrawerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [fetched, setFetched] = useState(false);

  function handleOpenChange(open: boolean) {
    if (!open || fetched) return;
    setFetched(true);

    if (mdxCache.has(mdxUrl)) {
      setContent(mdxCache.get(mdxUrl)!);
      return;
    }

    fetch(mdxUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const text = await res.text();
        return (
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
            .replace(/\n{3,}/g, "\n\n")
        );
      })
      .then((parsed) => {
        mdxCache.set(mdxUrl, parsed);
        setContent(parsed);
      })
      .catch(() => setError(true));
  }

  return (
    <Drawer direction="right" onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <button
          data-umami-event="Documentation Drawer"
          className="text-xs cursor-pointer text-link"
          type="button"
        >
          {triggerLabel}
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b">
          <DrawerTitle>{drawerTitle}</DrawerTitle>
        </DrawerHeader>
        <div className="min-w-0 cve-description overflow-x-hidden overflow-y-auto px-4 pb-4 prose prose-sm dark:prose-invert max-w-none">
          {error ? (
            <p className="text-sm text-muted-foreground">
              Failed to load documentation. Please try again later.
            </p>
          ) : content === null ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Markdown linkBaseURL="https://docs.devguard.org/">
              {content}
            </Markdown>
          )}
        </div>
        <div className="p-4 border-t flex gap-2">
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">
              Close
            </Button>
          </DrawerClose>
          <Button className="flex-1" asChild>
            <a
              href={docsUrl}
              className="!text-primary-foreground"
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="Documentation Drawer - Check Documentation"
            >
              Check Documentation
            </a>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
