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
