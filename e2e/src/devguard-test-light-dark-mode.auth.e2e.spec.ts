// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardNavigationLevel, DevGuardPOM } from "./pom/devguard";

test.describe("DevGuard test light and dark mode", () => {
  test("test", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.modal().dismissWelcomeModalIfPresent();
    await devguardPOM.testLightDarkSystemMode(
      DevGuardNavigationLevel.Organization,
    );
  });
});
