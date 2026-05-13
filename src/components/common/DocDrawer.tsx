// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const controller = new AbortController();
    setContent(null);
    setError(false);

    fetch(mdxUrl, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const text = await res.text();
        const cleanedText = text.replace(/^---\n[\s\S]*?\n---\n/, "");
        return cleanedText.replace(/^import\s+.*\s+from\s+['"].*['"];?\n/gm, "");
      })
      .then(setContent)
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
      });

    return () => controller.abort();
  }, [mdxUrl]);

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <button className="text-xs cursor-pointer text-primary" type="button">
          {triggerLabel}
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
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
          <Button
            className="flex-1"
            onClick={() => window.open(docsUrl, "_blank")}
          >
            Check Documentation
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
