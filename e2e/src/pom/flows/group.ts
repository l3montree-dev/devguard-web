import type { Page } from "@playwright/test";

export class GroupFlow {
  constructor(private page: Page) {}

  async createGroup(name: string, description: string) {
    await this.page.getByTestId("create-group-button").click({ timeout: 30_000 });
    await this.page.getByTestId("group-name").waitFor({ state: "visible" });
    await this.page.getByTestId("group-name").click();
    await this.page.getByTestId("group-name").fill(name);
    await this.page.getByTestId("group-description").click();
    await this.page.getByTestId("group-description").fill(description);
    await this.page.getByTestId("create-group-submit-button").click();
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
    await this.page.getByRole("link", { name: "Test Group" }).first().click({ timeout: 10_000 });
    await this.page.getByTestId("nav-group-overview").click();
    await this.page.getByTestId("nav-group-releases").click();
    await this.page.getByTestId("nav-group-subgroups-repositories").click();
    await this.page.getByTestId("nav-group-package-search").click();
    await this.page.getByTestId("nav-group-settings").click();
  }
}
