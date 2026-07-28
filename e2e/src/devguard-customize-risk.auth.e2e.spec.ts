// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { docShot } from "./doc-shot";

test.use({ viewport: { width: 1440, height: 900 } });


test.describe("DevGuard customize risk scores", () => {
  let devguardPOM: DevGuardPOM;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.createTestOrganizationGroupAndRepo();
  });

  test("test customize risk scores", async ({ page }, testInfo) => {
    await devguardPOM.repo().openSecurityRequirements();
    await page.waitForTimeout(5_000);
    await docShot(page, testInfo, "security-requirements-settings");
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByTestId("reporting-range").click();
    await page.mouse.wheel(0, 200); 
    await page.waitForTimeout(2_000);
    await docShot(page, testInfo, "reporting-range-settings");
    await page.mouse.wheel(0, 300); 
    await page.getByTestId("vuln-auto-reopen-switch").click();
    await page.getByRole('combobox').click();
    await page.waitForTimeout(2_000);
    await docShot(page, testInfo, "auto-reopen-settings");
    await page.locator('html').click();
    await page.getByTestId("paranoid-mode").click();
    await page.waitForTimeout(2_000);
    await docShot(page, testInfo, "paranoid-mode-settings");
  });
});