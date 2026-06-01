// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { test } from "@playwright/test";
import { describe } from "node:test";
import { DevGuardPOM } from "./pom/devguard";
import { envConfig } from "./utils";

describe("DevGuard invite a user to your organization", () => {
  test("test", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    console.log(`Registering new user ${username}`);
    await devguardPOM.registerWithEmailAndPassword(email, username, envConfig.devGuard.password);

    // Creates Organization
    await devguardPOM.createOrganization("TestOrg");

    // Invite Member
    await devguardPOM.inviteUserOrg("testuser@example.com");
  });
});
