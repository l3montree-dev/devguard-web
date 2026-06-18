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
}
