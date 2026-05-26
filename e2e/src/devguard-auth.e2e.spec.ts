// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { loginToDevGuardUsingOpenCode } from "./utils";

test.describe("Authentication", () => {
  test("can log in via OpenCode and see the dashboard", async ({ page }) => {
    const pom = new DevGuardPOM(page);

    await loginToDevGuardUsingOpenCode(page);

    await pom.verifyOnDevGuardURL();
    await expect(
      page.getByRole("link", { name: "OD", exact: true }),
    ).toBeVisible();
  });

  test("can log out and land on the login page", async ({ page }) => {
    const pom = new DevGuardPOM(page);

    await loginToDevGuardUsingOpenCode(page);
    await pom.logout();

    await pom.verifyOnDevGuardLoginURL();
    await expect(
      page.getByRole("button", { name: /Sign in with/ }),
    ).toBeVisible();
  });
});
