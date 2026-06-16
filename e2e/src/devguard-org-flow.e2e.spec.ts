// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardNavigationLevel, DevGuardPOM } from "./pom/devguard";

test.describe("DevGuard Org Test flows", () => {
  test("Org Creation test", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadAndRegister();
    await devguardPOM.org().createOrganization("Test Org");
  });

  test("Org Double Creation", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadAndRegister();
    await devguardPOM.org().createOrganization("Test Organization");
    await devguardPOM
      .org()
      .createSecondOrganization(
        "Second Test Org",
        DevGuardNavigationLevel.Organization,
      );
  });
});
