import { expect, Page } from "@playwright/test";

export class DevGuardPOM {
    constructor(public page: Page) { }

    async loadDevGuard() {
        await this.page.goto('https://main.devguard.org');
        await this.verifyOnDevGuardURL();
    }

    async logout() {
        await this.page.getByRole('link', { name: 'OD', exact: true }).click();
        await this.page.getByRole('link', { name: 'User Settings Logout' }).click();
    }

    async verifyOnDevGuardURL() {
        await expect(this.page).toHaveURL(new RegExp('^https://main.devguard.org/'), { timeout: 15_000 });
    }

    async verifyOnDevGuardLoginURL() {
        await expect(this.page).toHaveURL(new RegExp('^https://main.devguard.org/login'), { timeout: 15_000 });
    }

    async loginWithOpenCode() {
        await this.page.goto('https://main.devguard.org/login');
        await this.page.getByRole('button', { name: 'OpenCode Logo Sign in with' }).click();
        await this.page.waitForLoadState('networkidle');
    }

}