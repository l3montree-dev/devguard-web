// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { test } from "@playwright/test";
import { describe } from "node:test";

import { DevGuardPOM } from "./pom/devguard";
import { OpenCodePOM } from "./pom/opencode";

describe("OpenCode project handling", () => {
  test.beforeEach(async ({ page }) => {
    const openCodePOM = new OpenCodePOM(page);
    await openCodePOM.login(true);
  });

  test.afterEach(async ({ page }) => {
    const openCodePOM = new OpenCodePOM(page);
    await openCodePOM.logout();

    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.auth().logout();
    await devguardPOM.verifyOnDevGuardLoginURL();
  });

  test.afterAll(async ({ page }) => {
    const openCodePOM = new OpenCodePOM(page);
    await openCodePOM.revokeAppAccess();
    await openCodePOM.logout();

    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.auth().logout();
  });
});
