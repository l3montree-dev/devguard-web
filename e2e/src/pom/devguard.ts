import { expect, Page } from "@playwright/test";
import { envConfig } from "../utils";

export class DevGuardPOM {

    readonly devGuardDomain = envConfig.devGuard.domain;

    constructor(public page: Page) { }

    async loadDevGuard() {
        await this.page.goto(this.devGuardDomain);
        await this.verifyOnDevGuardURL();
    }

    async logout() {
        await this.page.getByRole('link', { name: 'OD', exact: true }).click();
        await this.page.getByRole('link', { name: 'User Settings Logout' }).click();
    }

    async verifyOnDevGuardURL() {
        await expect(this.page).toHaveURL(new RegExp(`^${this.devGuardDomain}/`), { timeout: 15_000 });
    }

    async verifyOnDevGuardLoginURL() {
        await expect(this.page).toHaveURL(new RegExp(`^${this.devGuardDomain}/login`), { timeout: 15_000 });
    }

    async loginWithOpenCode() {
        await this.page.goto(`${this.devGuardDomain}/login`);
        await this.page.getByRole('button', { name: 'OpenCode Logo Sign in with' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async registerWithEmail(username: string, password: string) {
        await this.page.goto(`${this.devGuardDomain}/login`);
        await this.page.getByRole('tab', { name: 'Legacy Password Login' }).click();
        await this.page.getByRole('link', { name: 'Sign up for free' }).click();
        await this.page.locator('input[name="traits.email"]').click();
        await this.page.locator('input[name="traits.email"]').fill(username);
        await this.page.locator('input[name="traits.name.first"]').click();
        await this.page.locator('input[name="traits.name.first"]').fill('Test');
        await this.page.locator('input[name="traits.name.last"]').click();
        await this.page.locator('input[name="traits.name.last"]').fill('User');
        await this.page.getByRole('checkbox', { name: 'I agree to the terms of use' }).click();
        await expect(this.page.getByRole('checkbox', { name: 'I agree to the terms of use' })).toBeChecked();

        await this.page.getByRole('button', { name: 'Sign up' }).click();

        await expect(this.page.getByText('Please choose a credential to authenticate yourself with.')).toBeVisible({ timeout: 10_000});
        await this.page.locator('input[name="password"]').click();
        await this.page.locator('input[name="password"]').fill(password);
        await this.page.getByRole('button', { name: 'Sign up', exact: true }).click();

        console.log("Registered user with email: " + username + " and password: " + password);

        if (!this.devGuardDomain.includes("localhost")) {
            // email validation only for non-localhost deployments
            await expect(this.page.getByText('An email containing a verification code has been sent to the email address you provided. If you have not received an email, check the spelling of the address and make sure to use the address you registered with.')).toBeVisible({ timeout: 10_000 });

            console.log("Please check your emails, enter the verification code and click on 'Continue'");

            // await page.getByRole('textbox').click({timeout: 10_000});
            // await page.getByRole('textbox').fill(code);
            // await page.getByRole('button', { name: 'Continue' }).click();

            await expect(this.page.getByText('You successfully verified your email address.')).toBeVisible({ timeout: 120_000 });

            await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
        }
    }
    async registerWithEmailwithoutVerification(username: string, password: string) {
        await this.page.goto(`${this.devGuardDomain}/login`);
        await this.page.getByRole('tab', { name: 'Legacy Password Login' }).click();
        await this.page.getByRole('link', { name: 'Sign up for free' }).click();
        await this.page.locator('input[name="traits.email"]').click();
        await this.page.locator('input[name="traits.email"]').fill(username);
        await this.page.locator('input[name="traits.name.first"]').click();
        await this.page.locator('input[name="traits.name.first"]').fill('Test');
        await this.page.locator('input[name="traits.name.last"]').click();
        await this.page.locator('input[name="traits.name.last"]').fill('User');
        await this.page.getByRole('checkbox', { name: 'I agree to the terms of use' }).click();
        await expect(this.page.getByRole('checkbox', { name: 'I agree to the terms of use' })).toBeChecked();

        await this.page.getByRole('button', { name: 'Sign up' }).click();

        await expect(this.page.getByText('Please choose a credential to authenticate yourself with.')).toBeVisible({ timeout: 10_000});
        await this.page.locator('input[name="password"]').click();
        await this.page.locator('input[name="password"]').fill(password);
        await this.page.getByRole('button', { name: 'Sign up', exact: true }).click();

        console.log("Registered user with email: " + username + " and password: " + password);

        if (!this.devGuardDomain.includes("localhost")) {
            // email validation only for non-localhost deployments
            await expect(this.page.getByText('An email containing a verification code has been sent to the email address you provided. If you have not received an email, check the spelling of the address and make sure to use the address you registered with.')).toBeVisible({ timeout: 10_000 });

            console.log("Please check your emails, enter the verification code and click on 'Continue'");
        }
        await this.page.getByRole('button', { name: 'Go back' }).click();
    }
    

    async createRepo(name: string, description: string) {
        await this.page.getByRole('button', { name: 'Create new Repository' }).click({ timeout: 10_000 });
        await expect(this.page.getByRole('textbox', { name: 'Name' })).toBeVisible();
        await this.page.getByRole('textbox', { name: 'Name' }).click();
        await this.page.getByRole('textbox', { name: 'Name' }).fill(name);
        await this.page.getByRole('textbox', { name: 'Description' }).fill(description);
        await this.page.getByRole('button', { name: 'Create' }).click();
    }

    async createGroup(name: string, description: string) {
        await this.page.getByRole('button', { name: 'New Group' }).click({ timeout: 30_000 });
        await expect(this.page.getByRole('textbox', { name: 'Name' })).toBeVisible();
        await this.page.getByRole('textbox', { name: 'Name' }).fill(name);
        await this.page.getByRole('textbox', { name: 'Description' }).click();
        await this.page.getByRole('textbox', { name: 'Description' }).fill(description);
        await this.page.getByRole('button', { name: 'Create' }).click();
    }

    async createOrganization(name: string) {
        await this.page.getByRole('textbox', { name: 'Organization name*' }).click();
        await expect(this.page.getByRole('textbox', { name: 'Organization name*' })).toBeVisible();
        await this.page.getByRole('textbox', { name: 'Organization name*' }).fill(name);
        await this.page.getByRole('button', { name: 'Create Organization' }).click();
    }

    async createTestOrganizationGroupAndRepo() {
        await this.createOrganization('Test Organization');
        await this.createGroup('Test Group', 'Test Group that contains very important projects!');
        await this.createRepo('Test Repo', 'This repo contains top secret information. Without a Provider though..');
    }

    async setupFlow_setupRiskScanning() {
        // setup risk scanning
        await this.page.getByRole('button', { name: 'Setup Risk Scanning' }).click();
        await this.page.waitForTimeout(500);
        await this.page.getByRole('heading', { name: 'Use your own Scanner Expert' }).click();
        await this.page.locator('button[id="scanner-selection-continue"]').click();
        await this.page.getByText('Use our CLIRecommendedUse the').click();
        await this.page.locator('#integration-method-selection-continue').click();
        //await this.page.locator('#radix-_r_2r_-trigger-sarif').click();
        //await this.page.locator('#radix-_r_2r_-trigger-sbom').click();
        //await this.page.locator('#radix-_r_2r_-content-sbom').getByRole('button', { name: 'Copy' }).click();
        //await this.page.locator('#radix-_r_2r_-trigger-sarif').click();
        //await this.page.locator('#radix-_r_2r_-content-sarif').getByRole('button', { name: 'Copy' }).click();
        //await this.page.locator('#radix-_r_2r_-trigger-sbom').click();
        await this.page.getByRole('button', { name: 'Create Personal Access Token' }).click();
        await this.page.getByRole('button', { name: 'Copy' }).nth(4).click();
        await this.page.locator('#automated-integration-continue').click();
    }

    async setupFlow_selectManualUpload() {
        await this.page.waitForTimeout(500);
        await this.page.getByRole('heading', { name: 'Upload manually File Upload' }).click();
        await this.page.locator('button[id="integration-method-selection-continue"]').click();
    }

    async setupFlow_uploadSbomFile(inputFile: string) {
        await this.page.waitForTimeout(500);
        await this.page.locator('#file-upload-sbom  input').setInputFiles(inputFile);
        await this.page.locator('button[id="manual-integration-continue"]').click();
    }

    async deleteRepo(){
        await this.page.getByRole('link', { name: 'Settings' }).nth(3).click();
        await this.page.getByRole('button', { name: 'Delete' }).click();
        await this.page.getByRole('button', { name: 'Confirm' }).click();
    }

    async testLightDarkMode(){
        await this.page.locator('#radix-_r_h_').click();
        await this.page.getByRole('menuitem', { name: 'Dark' }).click();
        await this.page.locator('#radix-_r_h_').click();
        await this.page.getByRole('menuitem', { name: 'System' }).click();
        await this.page.locator('#radix-_r_h_').click();
        await this.page.getByRole('menuitem', { name: 'Light' }).click();
    }

    async settingClickthroughRepo(){
        await this.page.getByRole('link', { name: 'Settings' }).nth(3).click();
        await this.page.getByRole('combobox', { name: 'Confidentiality Requirement' }).click();
        await this.page.getByRole('option', { name: 'Low' }).click();
        await this.page.getByRole('combobox', { name: 'Integrity Requirement' }).click();
        await this.page.getByRole('option', { name: 'High' }).click();
        await this.page.getByRole('combobox', { name: 'Availability Requirement' }).click();
        await this.page.getByRole('option', { name: 'Low' }).click();
        await this.page.getByRole('combobox', { name: 'Automatically reopen accepted' }).click();
        await this.page.getByLabel('Year').getByText('Year').click();
        //await this.page.locator('[id="_r_4r_-form-item"]').click();
        //await this.page.locator('[id="_r_4s_-form-item"]').click();
        await this.page.getByRole('button', { name: 'Add Member' }).click();
        await this.page.getByRole('combobox').click();
        await this.page.getByRole('button', { name: 'Close' }).click();
    }

    async checkHeaderGroup(){
        await this.page.getByRole('link', { name: 'Test Group' }).nth(1).click();
        await this.page.getByRole('link', { name: 'Overview' }).click();
        await this.page.getByRole('link', { name: 'Releases' }).click();
        await this.page.getByRole('link', { name: 'Subgroups & Repositories' }).click();
        await this.page.getByRole('link', { name: 'Compliance' }).nth(1).click();
        await this.page.getByRole('link', { name: 'Settings' }).nth(2).click();
    }

    async checkNewReleaseGroup(){
        await this.page.getByRole('link', { name: 'Overview' }).click();
        await this.page.getByRole('button', { name: 'Create new release' }).click();
        await this.page.getByRole('button', { name: 'Create new Release' }).click();
        await this.page.getByRole('textbox', { name: 'Release name like pkg:maven/' }).click();
        await this.page.getByRole('textbox', { name: 'Release name like pkg:maven/' }).fill('Test');
        await this.page.getByRole('combobox').filter({ hasText: 'Select artifacts' }).click();
        await this.page.getByRole('combobox').filter({ hasText: 'Select artifacts' }).click();
        await this.page.getByRole('combobox').filter({ hasText: 'Select existing releases' }).click();
        await this.page.getByRole('combobox').filter({ hasText: 'Select existing releases' }).click();
        await this.page.getByRole('button', { name: 'Create Release' }).click();
        await this.page.getByRole('button', { name: 'Delete' }).click();
        await this.page.getByRole('button', { name: 'Confirm' }).click();
    }

    async createNewSubgroup(){
        await this.page.getByRole('link', { name: 'Overview' }).click();
        await this.page.getByRole('button', { name: 'Create new release' }).click();
        await this.page.getByRole('button', { name: 'Create new Release' }).click();
        await this.page.getByRole('textbox', { name: 'Release name like pkg:maven/' }).click();
        await this.page.getByRole('textbox', { name: 'Release name like pkg:maven/' }).fill('Test');
        await this.page.getByRole('combobox').filter({ hasText: 'Select artifacts' }).click();
        await this.page.getByRole('combobox').filter({ hasText: 'Select artifacts' }).click();
        await this.page.getByRole('combobox').filter({ hasText: 'Select existing releases' }).click();
        await this.page.getByRole('combobox').filter({ hasText: 'Select existing releases' }).click();
        await this.page.getByRole('button', { name: 'Create Release' }).click();
        await this.page.getByRole('button', { name: 'Delete' }).click();
        await this.page.getByRole('button', { name: 'Confirm' }).click();
        await this.page.getByRole('link', { name: 'Subgroups & Repositories' }).click();
        await this.page.getByRole('button', { name: 'Create subgroup' }).click();
        await this.page.getByRole('textbox', { name: 'Name' }).fill('Test');
        await this.page.getByRole('textbox', { name: 'Description' }).click();
        await this.page.getByRole('textbox', { name: 'Description' }).fill('Test');
        await this.page.getByRole('button', { name: 'Create' }).click();
        await this.page.getByRole('link', { name: 'Settings' }).nth(2).click();
        await this.page.getByRole('button', { name: 'Delete' }).click();
        await this.page.getByRole('button', { name: 'Confirm' }).click();
    }

    async checkHeaderOrganization(){
        //await this.page.getByRole('link', { name: 'Test Organization' }).nth(1).click();
        await this.page.getByRole('link', { name: 'Compliance' }).click();
        await this.page.getByRole('link', { name: 'Settings', exact: true }).click();
        await this.page.getByRole('link', { name: 'Groups' }).click();
    }


}




