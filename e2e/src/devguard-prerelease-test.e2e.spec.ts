// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
import { test, expect } from '@playwright/test';
import { describe } from 'node:test';
import { DevGuardPOM } from './pom/devguard';
import { envConfig } from './utils';
import { set } from 'lodash';

describe('DevGuard pre-Release Test flow', () => {
    test('pre-Release Test (complete', async ({ page }) => {
        const devguardPOM = new DevGuardPOM(page);
        await devguardPOM.loadDevGuard();
        const username = envConfig.devGuard.uniqueUsername()
        console.log(`Registering new user ${username}`);
        await devguardPOM.registerWithEmailwithoutVerification(username, envConfig.devGuard.password);
        await page.waitForTimeout(2500);
        await devguardPOM.createOrganization('Test');
        await page.waitForTimeout(2000);
        //Creates Group
        await devguardPOM.createGroup('Test','Test');
        await page.waitForTimeout(1000);
        //Creates Repo
        await devguardPOM.createRepo('readyForDelete','deleteMe')
        //Creates Risk Scanning
        await devguardPOM.setupFlow_setupRiskScanning();
        await page.waitForTimeout(1000);
        //Check Setting Functionalities
        await devguardPOM.settingClickthroughRepo();
        await devguardPOM.deleteRepo();
        //Check Header Gruops
        await devguardPOM.checkHeaderGroup();
        //Check New Release on Group Level
        await devguardPOM.checkNewReleaseGroup();
        //Check Creating a new SubGroup + Delete
        await devguardPOM.createNewSubgroup();
        //Check Headers in Organization Level();
        await devguardPOM.checkHeaderOrganization();
        await page.waitForTimeout(1000);
        //Creates new Group
        await devguardPOM.createGroup('Bye','Bye');
        //Creates New Repo
        await devguardPOM.createRepo('Bye','Bye');
        //Tests SBOM Upload
        await devguardPOM.setupFlow_uploadSbomFile('./assets/sbom.json');




        await page.waitForTimeout(5000);
        //Deletes Repo
       
        await devguardPOM.deleteRepo();
    });


})