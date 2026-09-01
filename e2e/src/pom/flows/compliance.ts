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

  // A control id like "Grundschutz++:BES.4.6" only survives the round trip
  // through the url if the api percent-decodes the path param, so open a
  // row that actually carries characters needing encoding.
  async openCompliancePostureNeedingUrlEncoding() {
    const row = this.page
      .locator(
        '[data-testid="compliance-posture-row"][data-framework-control-id*="+"], [data-testid="compliance-posture-row"][data-framework-control-id*=":"]',
      )
      .first();
    await row.waitFor({ state: "visible", timeout: 10_000 });

    const frameworkControlID = (await row.getAttribute(
      "data-framework-control-id",
    ))!;
    expect(frameworkControlID).toMatch(/[+:]/);
    const title = (await row.locator("td").first().innerText()).trim();

    await row.click({ timeout: 10_000 });

    await expect
      .poll(() => decodeURIComponent(new URL(this.page.url()).pathname), {
        timeout: 10_000,
      })
      .toContain(`/compliance-postures/${frameworkControlID}`);

    await expect(
      this.page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible({ timeout: 30_000 });

    return { frameworkControlID, title };
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
