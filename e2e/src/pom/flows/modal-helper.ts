// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { Page } from "@playwright/test";

const TOUR_KEYS = [
  "org-home",
  "org-settings",
  "org-overview",
  "group-home",
  "repo-home",
  "repo-setup",
  "repo-settings",
  "dependency-risk",
  "dependency-insights",
];

export async function suppressOverlays(page: Page) {
  await page.addInitScript((tourKeys: string[]) => {
    tourKeys.forEach((key) =>
      localStorage.setItem(`devguard:tourSeen:${key}`, "true"),
    );
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "[data-sonner-toaster]{display:none !important}";
      document.head.append(style);
    });
  }, TOUR_KEYS);
}
