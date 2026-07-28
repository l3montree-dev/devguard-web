import type { Page } from "@playwright/test";
import { DevGuardNavigationLevel } from "../devguard";

export class GroupFlow {
  constructor(private page: Page) {}

  private async dismissAnyOverlay() {
    const exploreButton = this.page.getByTestId("explore-button");
    try {
      await exploreButton.waitFor({ state: "visible", timeout: 30_000 });
      await exploreButton.click();
      await this.page
        .locator(".DialogOverlay")
        .waitFor({ state: "hidden", timeout: 10_000 });
    } catch {
      // no modal present
    }
  }

  async createGroup(name: string, description: string) {
    await this.page
      .getByTestId("create-group-button")
      .click({ timeout: 30_000 });
    await this.page.getByTestId("group-name").waitFor({ state: "visible" });
    await this.page.getByTestId("group-name").click();
    await this.page.getByTestId("group-name").fill(name);
    await this.page.getByTestId("group-description").click();
    await this.page.getByTestId("group-description").fill(description);
    await this.page.getByTestId("create-group-submit-button").click();
  }

  async openSubgroupsAndRepositories() {
    await this.page
      .locator(
        `${DevGuardNavigationLevel.Group} [data-testid="nav-group-subgroups-repositories"]`,
      )
      .click({ timeout: 30_000 });
    await this.page
      .getByTestId("create-repository-button")
      .waitFor({ state: "visible", timeout: 30_000 });
  }

  async createNewSubgroup() {
    await this.page.getByTestId("nav-group-subgroups-repositories").click();
    await this.page.getByTestId("create-subgroup-button").click();
    await this.page.getByTestId("group-name").fill("Test");
    await this.page.getByTestId("group-description").click();
    await this.page.getByTestId("group-description").fill("Test");
    await this.page.getByRole("button", { name: "Create" }).click();
  }

  async checkHeaderGroup() {
    await this.dismissAnyOverlay();
    await this.page
      .getByRole("link", { name: "Test Group" })
      .first()
      .click({ timeout: 30_000 });
    await this.page.getByTestId("nav-group-overview").click();
    await this.page.getByTestId("nav-group-releases").click();
    await this.page.getByTestId("nav-group-subgroups-repositories").click();
    await this.page.getByTestId("nav-group-package-search").click();
    await this.page.getByTestId("nav-group-settings").click();
  }
}
