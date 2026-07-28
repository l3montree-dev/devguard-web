import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { ModalHelper } from "./modal-helper";

export class VulnFlow {
  constructor(private page: Page) {}

  // The assessment justification and the VEX rule justification both use the
  // markdown editor, so scope it when a dialog adds a second one to the page.
  private async fillJustification(text: string, scope?: Locator) {
    const editor = (scope ?? this.page)
      .getByRole("textbox", { name: "editable markdown" })
      .getByRole("paragraph");
    await editor.click();
    await editor.fill(text);
  }

  async openFirstAffectedComponent() {
<<<<<<< HEAD
=======
    // Follows the SBOM upload, whose toast covers the asset nav.
    await new ModalHelper(this.page).dismissToasts();
    await this.page
      .getByTestId("nav-asset-dependency-risks")
      .locator("a")
      .click({ timeout: 20_000 });
>>>>>>> origin/main
    const packageRows = this.page.getByTestId("package-row");
    await expect(packageRows.first()).toBeVisible({ timeout: 180_000 });
    await packageRows.first().click();

    const cveRows = this.page.getByTestId("cve-row");
    await expect(cveRows.first()).toBeVisible({ timeout: 10_000 });
    await cveRows.first().click();
  }

  // The assessment composer submits inline: write the justification first, then
  // the action button records the decision — there is no confirmation dialog.
  async markVulnAsFalsePositive() {
    const markFalsePositive = this.page.getByTestId("mark-false-positive");
    await expect(markFalsePositive).toBeVisible({ timeout: 20_000 });
    await this.fillJustification("This is a false positive because...");
    await markFalsePositive.click();
    // Leaving the open state removes the assessment actions from the composer.
    await expect(markFalsePositive).toBeHidden({ timeout: 20_000 });
  }

  async markVulnAsAcceptedRisk() {
    const markAcceptedRisk = this.page.getByTestId("mark-accepted-risk");
    await expect(markAcceptedRisk).toBeVisible({ timeout: 20_000 });
    await this.fillJustification("This is an accepted risk because...");
    await markAcceptedRisk.click();
    await expect(markAcceptedRisk).toBeHidden({ timeout: 20_000 });
  }

  // Clicking an edge of the path to the component opens the reduced VEX rule
  // dialog, prefilled with a rule that cuts exactly that edge.
  async markEdgeAsDoesNotCallVulnerableFunction() {
    const firstEdge = this.page.getByTestId("path-edge").first();
    await expect(firstEdge).toBeVisible({ timeout: 20_000 });
    await firstEdge.click();

    const dialog = this.page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "Add VEX rule", exact: true }),
    ).toBeVisible({ timeout: 10_000 });

    // Title and expression come from the path; the justification does not.
    await this.fillJustification(
      "The vulnerable function is not called along this path.",
      dialog,
    );
    await dialog.getByTestId("vex-rule-mark-false-positive").click();
    await expect(dialog).toBeHidden({ timeout: 20_000 });
  }

  async verifyVEXRule() {
    // Follows rule creation or a VEX upload, both of which toast.
    await new ModalHelper(this.page).dismissToasts();
    await this.page
      .getByTestId("nav-asset-dependency-risks")
      .locator("button")
      .click({ timeout: 20_000 });
    await this.page
      .getByTestId("nav-asset-vex-rules")
      .click({ timeout: 20_000 });
    const firstRuleRow = this.page.getByTestId("vex-rule-row").first();
    await expect(firstRuleRow).toBeVisible({ timeout: 20_000 });
    await firstRuleRow.click();

    const dialog = this.page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "VEX rule", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    // The rule is only meaningful if it actually resolves against findings.
    await expect(
      dialog.getByText(/Matches \d+ vulnerabilit(y|ies)/).first(),
    ).toBeVisible({ timeout: 20_000 });
  }

  async filterDependencyRisksTable() {
    await new ModalHelper(this.page).dismissToasts();
    await this.page
      .getByTestId("nav-asset-dependency-risks")
      .locator("a")
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
