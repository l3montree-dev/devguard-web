import { expect, Page } from "@playwright/test";
import { generateOTP } from "../utils";
import path from "path";
import dotenv from "dotenv";

// Read from ".env" file.
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

export class OpenCodePOM {

    readonly configOpenCode = {
        username: process.env.OPEN_CODE_USERNAME!,
        password: process.env.OPEN_CODE_PASSWORD!,
        totpSecret: process.env.OPEN_CODE_TOTP_SECRET!,
    }

    constructor(public page: Page) { 
        if(!this.configOpenCode.username || !this.configOpenCode.password || !this.configOpenCode.totpSecret) {
            throw new Error("Missing OpenCode configuration in environment variables.");
        }
    }

    async deleteRepo(userName: string, repoName: string) {
        await this.page.goto('https://gitlab.opencode.de/' + userName + '/' + repoName);
        await this.page.getByRole('button', { name: 'Settings' }).click();
        await this.page.getByRole('link', { name: 'OpenCode Logo' }).click();
        await this.page.getByRole('link', { name: 'Participate' }).click();
        await this.page.getByRole('button', { name: 'Login' }).click();
        await this.page.getByText('Enter the one-time code from').first().click();
        await this.page.getByText('Log in and use services').click();
        await this.page.getByLabel('Languages').click();
        await this.page.getByRole('menuitem', { name: 'Català' }).click();
        await this.page.getByRole('textbox', { name: 'Usuari o adreça electrònica' }).click();
        await this.page.getByRole('link', { name: 'General' }).click();
        await this.page.getByRole('heading', { name: 'Advanced' }).click();
        await this.page.getByTestId('delete-button').click();
        await this.page.getByTestId('confirm-name-field').click();
        await this.page.getByTestId('confirm-name-field').fill(userName + '/' + repoName);
        await this.page.getByTestId('confirm-delete-button').click();
    }

    async createRepo(repoName: string) {
        const userName = 'david'
        // Create new repo
        await this.page.getByTestId('new-project-button').click();
        await this.page.getByRole('link', { name: 'Create blank project Create a' }).click();
        await this.page.getByRole('textbox', { name: 'Project name Project name' }).click();
        await this.page.getByRole('textbox', { name: 'Project name Project name' }).fill(repoName);
        await this.page.locator('#blank-project-pane').getByText('Private').click();
        await this.page.getByRole('button', { name: 'Create project' }).click();
        await this.page.getByRole('button', { name: '‎Pick a group or namespace‎' }).click();
        await this.page.getByTestId('listbox-item-gid://gitlab/Namespaces::UserNamespace/11826').getByText(userName).click();
        await this.page.getByRole('button', { name: 'Create project' }).click();
    }

    async logout() {
        // Logout
        await this.page.getByTestId('user-menu-toggle').click();
        await this.page.getByTestId('sign-out-link').click();
        await this.page.getByRole('button', { name: 'Logout' }).click();
        await this.page.waitForTimeout(2_000);
    }

    async loadOpenCode() {
        await this.page.goto('https://gitlab.opencode.de');
    }

    async verifyOnOpenCodeLoginURL() {
        await expect(this.page).toHaveURL(new RegExp('^https://keycloak.opencode.de/auth/realms/osr/protocol/openid-connect/auth'), { timeout: 15_000 });
    }

    async login(shouldRedirect: boolean = false) {
        if (shouldRedirect) {
            await this.loadOpenCode();
        } else {
            await this.verifyOnOpenCodeLoginURL();
        }
        await this.page.getByRole('textbox', { name: 'Username or email' }).click();
        await this.page.getByRole('textbox', { name: 'Username or email' }).fill(this.configOpenCode.username);
        await this.page.getByRole('textbox', { name: 'Password' }).click();
        await this.page.getByRole('textbox', { name: 'Password' }).fill(this.configOpenCode.password);
        await this.page.getByRole('button', { name: 'Sign In' }).click();
        const otp = await generateOTP(this.configOpenCode.totpSecret);
        await this.page.getByRole('textbox', { name: 'One-time code' }).fill(otp);
        await this.page.getByRole('button', { name: 'Sign In' }).click();
        
        await this.page.waitForTimeout(500); // not sure why.. but otherwise the VR tests get stuck sometimes
        if(await this.page.getByRole('button', { name: 'Only necessary Cookies' }).isVisible()) {
            await this.page.getByRole('button', { name: 'Only necessary Cookies' }).click();
        }
    }

    async grantAccess() {
        this.page.waitForLoadState('networkidle');
        const url = this.page.url();
        if (url.match(new RegExp('^https://gitlab.opencode.de/oauth/authorize'))) {
            // click on authorize button in openCode
            await this.page.getByTestId('authorization-button').click();
        } else {
            console.log("already logged in")
        }
        // await expect(this.page).toHaveURL(new RegExp('^https://gitlab.opencode.de/oauth/authorize'), { timeout: 15_000 });
    }

    async revokeAppAccess() {
        await this.page.getByTestId('user-menu-toggle').click();
        await this.page.getByRole('link', { name: 'Preferences' }).click();
        await this.page.getByRole('link', { name: 'Applications' }).click();
        // await this.page.waitForURL(new RegExp(`^https://gitlab.opencode.de/-/user_settings/applications`))

        if (!await this.page.getByText("You don't have any authorized applications.").isVisible()) {
            await this.page.getByRole('button', { name: 'Revoke application' }).click();
            await this.page.getByTestId('confirm-ok-button').click();
        }
    }
}