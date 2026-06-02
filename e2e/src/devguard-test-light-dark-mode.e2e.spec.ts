// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { test, expect } from "@playwright/test";
import { describe } from "node:test";
import { DevGuardNavigationLevel, DevGuardPOM } from "./pom/devguard";
import { envConfig } from "./utils";

describe("DevGuard test light and dark mode", () => {
  test("test", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    console.log(`Registering new user ${username}`);
    await devguardPOM.auth().registerWithEmailAndPassword(email, username, envConfig.devGuard.password);

    await devguardPOM.org().createOrganization("TestOrg");

    await devguardPOM.testLightDarkSystemMode(
      DevGuardNavigationLevel.Organization,
    );
  });
});
