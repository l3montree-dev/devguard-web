// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
import { test, expect } from '@playwright/test';
import { describe } from 'node:test';
import { DevGuardPOM } from './pom/devguard';
import { envConfig } from './utils';

describe('DevGuard create and delete repo flows', () => {
    test('test', async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername()
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);
    //Creates Organization
    await devguardPOM.createOrganization('Test');
    await page.waitForTimeout(500);
    //Creates Group
    await devguardPOM.createTestOrganizationGroupAndRepo();
    await page.waitForTimeout(500);
    

    //Deletes Repo
    await devguardPOM.deleteRepo();
    
   
    await page.waitForTimeout(500_000);
  });
/* 
  // TEMPLATE FOR NEW TESTS
  test('test', async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername()
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);

    // await devguardPOM.createTestOrganizationGroupAndRepo();

    // my code goes here...

    await page.waitForTimeout(500_000);
  });
  */
})