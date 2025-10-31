// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
import { test } from "@playwright/test";
import { describe } from "node:test";
import { DevGuardPOM } from "./pom/devguard";
import { envConfig } from "./utils";

describe("DevGuard pre-Release Test flow", () => {
  test("pre-Release Test (complete", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    await devguardPOM.registerWithEmailwithoutVerification(
      username,
      envConfig.devGuard.password,
    );

    await devguardPOM.createTestOrganizationGroupAndRepo();

    // delete repo
    await devguardPOM.deleteRepo();

    // Check Header Gruops
    await devguardPOM.checkHeaderGroup();

    // Check Creating a new SubGroup
    await devguardPOM.createNewSubgroup();

    // Check Headers in Organization Level();
    await devguardPOM.checkHeaderOrganization();

    await page.waitForTimeout(5_000);
  });
});
