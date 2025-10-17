import { test, expect } from '@playwright/test';
import { describe } from 'node:test';
import { DevGuardPOM } from './pom/devguard';
import path from 'path';
import { envConfig } from './utils';


describe('DevGuard Other flows', () => {

  test('test manual sbom upload', async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername()
    console.log(`Registering new user ${username}`);
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);

    await devguardPOM.createTestOrganizationGroupAndRepo();

    // set path for upload sample sbom
    const inputFile = path.join(__dirname, "../assets/", 'sbom.json');
    console.log(`Usign SBOM from path: ${inputFile}`);

    // setup risk scanning
    await page.getByRole('button', { name: 'Setup Risk Scanning' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('heading', { name: 'Use your own Scanner Expert' }).click();
    await page.locator('button[id="scanner-selection-continue"]').click();
    
    // select manual upload
    await page.waitForTimeout(500);
    await page.getByRole('heading', { name: 'Upload manually File Upload' }).click();
    await page.locator('button[id="integration-method-selection-continue"]').click();

    // upload sbom file
    await page.waitForTimeout(500);
    await page.locator('#file-upload-sbom  input').setInputFiles(inputFile);
    await page.locator('button[id="manual-integration-continue"]').click();

    await page.waitForTimeout(2_000);
    // TODO.. what else should we test or validate?
    // await page.waitForTimeout(120_000);
  });

  test('test something with an empty repo', async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername()
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);

    await devguardPOM.createTestOrganizationGroupAndRepo();

    
    await page.getByRole('button', { name: 'Setup Risk Scanning' }).click();
    await page.waitForTimeout(500);
    await page.getByText('BackSelect a Scanner').click();
    await page.waitForTimeout(500);
    await page.getByText('From our curated list of scans and scanners, select the ones you want to use.').click();
    await page.waitForTimeout(500);
    await page.locator('#scanner-selection-continue').click();
    await page.waitForTimeout(500);
    await page.locator('#scanner-options-selection-continue').click();

    // TODO.. continue here... 
    
    // await page.waitForTimeout(120_000);
  });
})