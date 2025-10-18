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
}