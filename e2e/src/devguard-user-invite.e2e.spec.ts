// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";

test.describe("DevGuard invite a user to your organization", () => {
  test("test", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadAndRegister();
    await devguardPOM.org().createOrganization("TestOrg");
    await devguardPOM.org().inviteUserOrg("testuser@example.com");
  });
});
