// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test, type Page } from "@playwright/test";
import { docShot } from "../../doc-shot";
import { DevGuardNavigationLevel } from "../devguard";

export class ComplianceFlow {
  constructor(private page: Page) {}

  async openOrgCompliancePostures() {
    await this.openCompliancePostures(
      DevGuardNavigationLevel.Organization,
      "nav-org-compliance-postures",
      "compliance-posture-organization",
    );
  }

  async openGroupCompliancePostures() {
    await this.openCompliancePostures(
      DevGuardNavigationLevel.Group,
      "nav-group-compliance-postures",
      "compliance-posture-group",
    );
  }

  async openRepoCompliancePostures() {
    await this.openCompliancePostures(
      DevGuardNavigationLevel.Repo,
      "nav-asset-compliance-postures",
      "compliance-posture-repository",
    );
  }

  // catalogs are not seeded, a new org has no postures until one is activated
  async activateDefaultCatalog(name: string) {
    await this.page
      .getByTestId("manage-catalogs-and-components")
      .click({ timeout: 10_000 });
    const dialog = this.page.getByRole("dialog");
    await dialog.getByTestId(`activate-${name}`).click({ timeout: 10_000 });
    await expect(dialog.getByRole("button", { name: "Remove" })).toBeVisible({
      timeout: 60_000,
    });
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });
  }

  async openCompliancePostureWithPlusInControlID() {
    const row = this.page
      .locator(
        '[data-testid="compliance-posture-row"][data-framework-control-ids*="+"]',
      )
      .first();
    await row.waitFor({ state: "visible", timeout: 10_000 });

    const title = (await row.locator("td").first().innerText()).trim();
    await row.click({ timeout: 10_000 });

    await expect(
      this.page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible({ timeout: 10_000 });

    await docShot(this.page, test.info(), "compliance-posture-subpage");
  }

  private async openCompliancePostures(
    level: DevGuardNavigationLevel,
    testId: string,
    screenshotName: string,
  ) {
    const navItem = this.page.locator(`${level} [data-testid="${testId}"]`);
    await navItem.waitFor({ state: "visible", timeout: 30_000 });
    await navItem.click({ timeout: 10_000 });

    await expect(this.page).toHaveURL(/\/compliance-postures/, {
      timeout: 10_000,
    });
    await docShot(this.page, test.info(), screenshotName);
  }
}
