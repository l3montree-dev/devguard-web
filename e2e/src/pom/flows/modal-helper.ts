import type { Page } from "@playwright/test";

export class ModalHelper {
  constructor(private page: Page) {}

  async dismissWelcomeModalIfPresent() {
    const exploreButton = this.page.getByTestId("explore-button");
    try {
      await exploreButton.waitFor({ state: "visible", timeout: 3_000 });
      await exploreButton.click();
      await this.page
        .locator(".DialogOverlay")
        .waitFor({ state: "hidden", timeout: 10_000 });
    } catch {
      // welcome modal not shown, continuing
    }
  }

  /**
   * Toasts render top-center, directly over the navigation, and sonner pauses
   * their auto-dismiss timer while the pointer is over the toaster. Playwright
   * hovers a click target before clicking it, so a toast covering the nav keeps
   * itself alive and the click underneath can never land — waiting it out
   * deadlocks. Call this before clicking anything the toaster can cover.
   */
  async dismissToasts() {
    const toasts = this.page.locator("[data-sonner-toast]");
    // Move off the toaster first, so paused auto-dismiss timers resume.
    await this.page.mouse.move(0, 0);
    for (let attempt = 0; attempt < 5 && (await toasts.count()) > 0; attempt++) {
      const closeButton = toasts.first().locator("[data-close-button]");
      if ((await closeButton.count()) === 0) break;
      // A toast already animating out makes the click miss; the loop re-checks.
      await closeButton.click({ timeout: 5_000 }).catch(() => {});
    }
    await toasts
      .first()
      .waitFor({ state: "detached", timeout: 10_000 })
      .catch(() => {
        // Still there: let the caller's click fail with its own diagnostics.
      });
  }
}
