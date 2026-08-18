import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { docShot } from "../../doc-shot";
import type { TestInfo } from "@playwright/test";
import { DevGuardNavigationLevel } from "../devguard";
import { RepoFlow } from "./repo";

export class VulnFlow {
  constructor(private page: Page) {}

  private repo(): RepoFlow {
    return new RepoFlow(this.page);
  }

  // The assessment justification and the VEX rule justification both use the
  // markdown editor, so scope it when a dialog adds a second one to the page.
  private async fillJustification(text: string, scope?: Locator) {
    const editor = (scope ?? this.page).getByRole("textbox", {
      name: /^Add (?:a |your )comment/,
    });
    await editor.click();
    await editor.fill(text);
  }

  async openFirstAffectedComponent() {
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

  async markEdgeAsDoesNotCallVulnerableFunction(
    testInfo: TestInfo,
    doScreenshot: boolean = true,
  ) {
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
    if (doScreenshot) {
      await docShot(
        this.page,
        testInfo,
        "vex-rule-mark-false-positive-from-path",
      );
    }
    await dialog.getByTestId("vex-rule-mark-false-positive").click();
    await expect(dialog).toBeHidden({ timeout: 20_000 });
  }

  async verifyVEXRule() {
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
      dialog
        .getByText(/Matches \d+ (open |closed )?vulnerabilit(y|ies)/)
        .first(),
    ).toBeVisible({ timeout: 20_000 });
  }

  async expectVulnState(state: string) {
    await expect(this.page.getByTestId("vuln-state")).toHaveText(state, {
      timeout: 20_000,
    });
  }

  async expectVulnStateEventually(state: string) {
    await this.repo().openDependencyRiskTable();
    await this.openFirstAffectedComponent();
    await expect(this.page.getByTestId("vuln-state")).toHaveText(state, {
      timeout: 5_000,
    });
  }

  async deleteFirstVexRule(testInfo: TestInfo) {
    await this.page.getByTestId("nav-asset-dependency-risks-chevron").click();
    await this.page
      .getByTestId("nav-asset-vex-rules")
      .click({ timeout: 20_000 });

    const firstRuleRow = this.page.getByTestId("vex-rule-row").first();
    await expect(firstRuleRow).toBeVisible({ timeout: 20_000 });

    await firstRuleRow.getByRole("button").click();
    await this.page.getByRole("menuitem", { name: "Delete" }).click();

    const confirmButton = this.page.getByTestId("alert-confirm-button");
    await expect(confirmButton).toBeVisible({ timeout: 10_000 });
    docShot(this.page, testInfo, "vex-rule-delete-confirmation-dialog");
    await confirmButton.click();
  }

  async expectVexRuleRecommendationVisible(testInfo?: TestInfo) {
    const card = this.page.getByTestId("vex-rule-recommendation-card");
    await expect(card).toBeVisible({ timeout: 20_000 });
    if (testInfo) {
      await docShot(this.page, testInfo, "vex-rule-recommendation-card", {
        locator: card,
      });
    }
  }

  async createVexRuleFromRecommendation() {
    await this.page
      .getByRole("button", { name: "Create VEX rule from recommendation" })
      .click({ timeout: 20_000 });

    const dialog = this.page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "Add VEX rule", exact: true }),
    ).toBeVisible({ timeout: 10_000 });

    await dialog.getByTestId("vex-rule-mark-false-positive").click();
    await expect(dialog).toBeHidden({ timeout: 20_000 });
  }

  async openGroups() {
    await this.page
      .getByRole("img", { name: /^DevGuard Logo$/ })
      .last()
      .click({ timeout: 20_000 });
    await this.page
      .locator(
        `${DevGuardNavigationLevel.Organization} [data-testid="nav-org-groups"]`,
      )
      .click({ timeout: 30_000 });
    await this.page
      .getByTestId("create-group-button")
      .or(this.page.getByTestId("create-group-form"))
      .first()
      .waitFor({ state: "visible", timeout: 30_000 });
  }

  async filterDependencyRisksTable() {
    await this.repo().openDependencyRiskTable();
    await this.page.waitForTimeout(1_000);
    await this.page.getByTestId("filter-open-button").click();
    await this.page.getByTestId("filter-field-select").click();
    await this.page.getByRole("option", { name: "CVSS" }).click();
    await this.page.getByTestId("filter-operator-select").click();
    await this.page.getByRole("option", { name: "is greater than" }).click();
    await this.page.getByTestId("filter-value-input").fill("7");
    await this.page.getByTestId("filter-apply-button").click();
  }
}
