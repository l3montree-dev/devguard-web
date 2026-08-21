// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Star } from "lucide-react";

export default function StarRepo() {
  return (
    <div className="flex h-7 overflow-hidden rounded-md border border-[#d0d7de] bg-[#f1f3f5] text-[#59636e] shadow-sm dark:border-[#3d444d] dark:bg-[#212830] dark:text-[#f0f6fc]">
      <a
        href={`https://github.com/l3montree-dev/devguard`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 text-sm font-semibold !text-[#59636e] hover:bg-[#e9ecef] hover:no-underline dark:!text-[#f0f6fc] dark:hover:bg-[#2a313c]"
        aria-label="Star DevGuard on GitHub"
        data-umami-event="Github Star Button Clicked"
      >
        <Star className="h-4 w-4 text-[#535c66] dark:text-[#9198a1]" />
        <span>Star</span>
      </a>
    </div>
  );
}
