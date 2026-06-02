import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export class VulnFlow {
  constructor(private page: Page) {}

  async openFirstAffectedComponent() {
    await this.page.getByTestId("nav-asset-dependency-risks").click({ timeout: 5_000 });
    const packageRows = this.page.getByTestId("package-row");
    await expect(packageRows.first()).toBeVisible({ timeout: 20_000 });
    await packageRows.first().click();

    const cveRows = this.page.getByTestId("cve-row");
    await expect(cveRows.first()).toBeVisible({ timeout: 10_000 });
    await cveRows.first().click();
  }

  async markVulnAsFalsePositive() {
    await this.page.getByTestId("mark-false-positive").click();
    await this.page.getByRole("textbox", { name: "editable markdown" }).getByRole("paragraph").click();
    await this.page.getByRole("textbox", { name: "editable markdown" }).getByRole("paragraph").fill("This is a false positive because...");
    await this.page.getByTestId("confirm-false-positive").click();
  }

  async markVulnAsAcceptedRisk() {
    await this.page.getByTestId("mark-accepted-risk").click();
    await this.page.getByRole("textbox", { name: "editable markdown" }).getByRole("paragraph").click();
    await this.page.getByRole("textbox", { name: "editable markdown" }).getByRole("paragraph").fill("This is an accepted risk because...");
    await this.page.getByTestId("confirm-accepted-risk").click();
  }
}
