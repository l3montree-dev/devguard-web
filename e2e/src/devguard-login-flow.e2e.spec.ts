// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { envConfig } from "./utils";

test.describe("DevGuard Email login flows", () => {
  test("test registration using email and password (new user)", async ({
    page,
  }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadAndRegister();
  });

  test("test registration with already existing user", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    await devguardPOM
      .auth()
      .registerWithEmailAndPassword(
        email,
        username,
        envConfig.devGuard.password,
      );

    await devguardPOM.auth().logout();

    await devguardPOM
      .auth()
      .registerWithEmailAndPassword(
        email,
        username,
        envConfig.devGuard.password,
      );

    await expect(
      devguardPOM.page.getByText(
        "An account with the same identifier (email, phone, username, ...) exists already.",
      ),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("test sign up and logout and login again with email and password", async ({
    page,
  }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    await devguardPOM
      .auth()
      .registerWithEmailAndPassword(
        email,
        username,
        envConfig.devGuard.password,
      );

    await devguardPOM.auth().logout();

    await devguardPOM
      .auth()
      .loginWithEmailAndPassword(email, envConfig.devGuard.password);
  });
});
