import type { Page } from "@playwright/test";

export class ModalHelper {
  constructor(private page: Page) {}

  async dismissToastIfPresent() {
    const closeToast = this.page
      .getByRole("button", { name: "Close toast" })
      .first();
    try {
      await closeToast.waitFor({ state: "visible", timeout: 5_000 });
      await closeToast.click({ timeout: 2_000 });
    } catch {
      // no Toast visible
    }
  }

  async dismissWelcomeModalIfPresent() {
    const exploreButton = this.page.getByTestId("explore-button");
    try {
      await exploreButton.waitFor({ state: "visible", timeout: 3_000 });
      await exploreButton.click({ timeout: 2_000 });
      await this.page.waitForTimeout(5_000);
    } catch {
      // welcome modal not shown, continuing
    }
  }
}
