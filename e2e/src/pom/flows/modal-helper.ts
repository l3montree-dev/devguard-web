// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { expect, type Page } from "@playwright/test";

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

// For specs that skip suppressOverlays and keep toasts visible for screenshots.
export async function clearToasts(page: Page) {
  // The global notice from Page.tsx is duration: Infinity - it only goes away
  // when its close button is clicked, which also persists the dismissal.
  const closeButton = page.getByRole("button", { name: "Close toast" });
  if (await closeButton.count()) {
    await closeButton.first().click({ timeout: 5_000 });
  }
  // Sonner pauses a toast's auto-close timer while the pointer is over it, so
  // leaving the mouse on the toaster keeps the remaining toasts alive - which
  // is also why letting Playwright retry a click through one deadlocks.
  await page.mouse.move(0, 0);
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0, {
    timeout: 15_000,
  });
}
