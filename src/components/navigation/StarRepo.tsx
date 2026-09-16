// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Star } from "lucide-react";

export default function StarRepo() {
  return (
    <div className="flex h-7 overflow-hidden rounded-md border border-secondary-foreground/10 bg-secondary">
      <a
        href={`https://github.com/l3montree-dev/devguard`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 text-sm font-semibold !text-secondary-foreground/65 hover:no-underline hover:bg-secondary-foreground/5"
        aria-label="Star DevGuard on GitHub"
        data-umami-event="Github Star Button Clicked"
      >
        <Star className="h-4 w-4" />
        <span className="dark:text-secondary-foreground">Star</span>
      </a>
    </div>
  );
}
