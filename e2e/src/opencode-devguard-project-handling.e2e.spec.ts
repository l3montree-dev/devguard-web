import { test } from '@playwright/test';
import { describe } from 'node:test';

import { DevGuardPOM } from "./pom/devguard";
import { OpenCodePOM } from "./pom/opencode";

describe('OpenCode project handling', () => {

  test.beforeEach(async ({ page }) => {
    const openCodePOM = new OpenCodePOM(page);
    await openCodePOM.login(true);
  });

  test.afterEach(async ({ page }) => {
    const openCodePOM = new OpenCodePOM(page);
    await openCodePOM.logout();

    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.logout();
    await devguardPOM.verifyOnDevGuardLoginURL();
  });

  test.afterAll(async ({page}) => {
    const openCodePOM = new OpenCodePOM(page);
    await openCodePOM.revokeAppAccess();
    await openCodePOM.logout();

    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.logout();
  })

  /*
  test('test bla', async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.loginWithOpenCode();
    await page.waitForTimeout(10_000);

    // TODO.. do whatever here 
  });
  */
});