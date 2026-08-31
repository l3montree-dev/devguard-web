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
import { useMdxDoc } from "@/hooks/useMdxDoc";

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
  const [opened, setOpened] = useState(false);
  const { content, error } = useMdxDoc(opened ? mdxUrl : null);

  function handleOpenChange(open: boolean) {
    if (open) setOpened(true);
  }

  return (
    <Drawer direction="right" onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <button
          data-umami-event="Documentation Drawer"
          className="text-xs cursor-pointer text-link text-left"
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
