import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export class VulnFlow {
  constructor(private page: Page) {}

  async openFirstAffectedComponent() {
    await this.page
      .getByTestId("nav-asset-dependency-risks")
      .click({ timeout: 20_000 });
    const packageRows = this.page.getByTestId("package-row");
    await expect(packageRows.first()).toBeVisible({ timeout: 60_000 });
    await packageRows.first().click();

    const cveRows = this.page.getByTestId("cve-row");
    await expect(cveRows.first()).toBeVisible({ timeout: 10_000 });
    await cveRows.first().click();
  }

  async markVulnAsFalsePositive() {
    await this.page.getByTestId("mark-false-positive").click();
    await this.page
      .getByRole("textbox", { name: "editable markdown" })
      .getByRole("paragraph")
      .click();
    await this.page
      .getByRole("textbox", { name: "editable markdown" })
      .getByRole("paragraph")
      .fill("This is a false positive because...");
    await this.page.getByTestId("confirm-false-positive").click();
  }

  async markVulnAsAcceptedRisk() {
    await this.page.getByTestId("mark-accepted-risk").click();
    await this.page
      .getByRole("textbox", { name: "editable markdown" })
      .getByRole("paragraph")
      .click();
    await this.page
      .getByRole("textbox", { name: "editable markdown" })
      .getByRole("paragraph")
      .fill("This is an accepted risk because...");
    await this.page.getByTestId("confirm-accepted-risk").click();
  }

  async markEdgeAsDoesNotCallVulnerableFunction() {
    const firstEdge = this.page.locator(".react-flow__edge").first();
    await expect(firstEdge).toBeVisible({ timeout: 10_000 });
    await firstEdge.click();

    const menuItem = this.page.getByTestId(
      "vex-does-not-call-vulnerable-function",
    );
    await expect(menuItem).toBeVisible({ timeout: 5_000 });
    await menuItem.click();
  }

  async verifyVEXRule() {
    await this.page
      .getByTestId("nav-asset-vex-rules")
      .click({ timeout: 20_000 });
    const firstHeaderRow = this.page.getByTestId("vex-header-row").first();
    await expect(firstHeaderRow).toBeVisible({ timeout: 20_000 });
    await firstHeaderRow.click();
    const firstRuleRow = this.page.getByTestId("vex-rule-row").first();
    await expect(firstRuleRow).toBeVisible({ timeout: 20_000 });
    await firstRuleRow.click();
    const dialog = this.page.getByLabel("VEX Rule Details");
    await expect(dialog.getByText(/Applies to \d+ findings?/)).toBeVisible({
      timeout: 20_000,
    });
  }

  async filterDependencyRisksTable() {
    await this.page
      .getByTestId("nav-asset-dependency-risks")
      .click({ timeout: 5_000 });
    await this.page.getByTestId("filter-open-button").click();
    await this.page.getByTestId("filter-field-select").click();
    await this.page.getByRole("option", { name: "CVSS" }).click();
    await this.page.getByTestId("filter-operator-select").click();
    await this.page.getByRole("option", { name: "is greater than" }).click();
    await this.page.getByTestId("filter-value-input").fill("7");
    await this.page.getByTestId("filter-apply-button").click();
  }
}
