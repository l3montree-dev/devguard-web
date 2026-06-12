// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";

test.describe.skip("DevGuard pre-Release Test flow", () => {
  test("pre-Release Test (complete)", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadAndRegister();
    await devguardPOM.createTestOrganizationGroupAndRepo();
    await devguardPOM.repo().deleteRepo();
    await devguardPOM.group().checkHeaderGroup();
    await devguardPOM.group().createNewSubgroup();
    await page.waitForTimeout(5_000);
  });
});
