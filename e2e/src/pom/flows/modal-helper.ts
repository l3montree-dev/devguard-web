import type { Page } from "@playwright/test";

const TOUR_KEYS = [
  "org-home",
  "org-settings",
  "org-overview",
  "group-home",
  "repo-home",
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
