// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";

test.describe("DevGuard invite a user to your organization", () => {
  test("test", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.modal().dismissWelcomeModalIfPresent();
    await devguardPOM.org().inviteUserOrg("testuser@example.com");
  });
});
