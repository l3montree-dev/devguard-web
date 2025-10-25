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
    await devguardPOM.setupFlow_setupRiskScanning();
    
    // select manual upload
    await devguardPOM.setupFlow_selectManualUpload();

    // upload sbom file
    await devguardPOM.setupFlow_uploadSbomFile(inputFile);

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

  test('test setting up group release', async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername()
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);

    await devguardPOM.createTestOrganizationGroupAndRepo();

    // set path for upload sample sbom
    const inputFileOk = path.join(__dirname, "../assets/", 'sbom.json');
    console.log(`Usign SBOM from path: ${inputFileOk}`);

    // setup risk scanning
    await devguardPOM.setupFlow_setupRiskScanning();
    await devguardPOM.setupFlow_selectManualUpload();
    await devguardPOM.setupFlow_uploadSbomFile(inputFileOk);

    await page.locator('a[title="Test Group"]').nth(1).click({timeout: 2_000}); // because multiple headers are stacked (for each org -> group -> repo)

    const inputFileNotOk = path.join(__dirname, "../assets/", 'devguard-web.json');
    console.log(`Usign SBOM from path: ${inputFileNotOk}`);
    await devguardPOM.createRepo('Test Repo 2', 'This repo contains top secret information.');
    await devguardPOM.setupFlow_setupRiskScanning();
    await devguardPOM.setupFlow_selectManualUpload();
    await devguardPOM.setupFlow_uploadSbomFile(inputFileNotOk);

    // create release at group level
    await page.locator('a[title="Test Group"]').nth(1).click({timeout: 2_000}); // because multiple headers are stacked (for each org -> group -> repo)

    await page.getByRole('link', { name: 'Releases' }).click();
    await page.getByRole('button', { name: 'Create new Release' }).click();
    await page.getByRole('textbox', { name: 'Release name' }).fill('pkg:l3montree/test/test@1.0.0');
    // await page.getByRole('combobox').filter({ hasText: 'Select artifacts' }).click();
    // await page.getByText('No artifacts found').click();
    await page.waitForTimeout(1_000);
    await page.getByRole('button', { name: 'Create Release' }).click();
    
    // because of https://github.com/l3montree-dev/devguard/issues/1296
    await page.reload();

    // Go back to overview page
    await page.getByRole('link', { name: 'Overview' }).click();

    await page.waitForTimeout(120_000);
  });
})