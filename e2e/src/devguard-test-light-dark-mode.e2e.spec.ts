// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { test, expect } from '@playwright/test';
import { describe } from 'node:test';
import { DevGuardPOM } from './pom/devguard';
import { envConfig } from './utils';

describe('DevGuard test light and dark mode', () => {
 test('test', async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername()
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);
    //Creates Organization
    await devguardPOM.createOrganization('Test');
    //await page.waitForTimeout(500);

    //Test light, dark and system mode
    await devguardPOM.testLightDarkMode();

    await page.waitForTimeout(500_000);
 });
})