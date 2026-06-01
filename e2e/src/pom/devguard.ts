import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { envConfig, LoggingAnalyzer } from "../utils";

export enum DevGuardNavigationLevel {
  Root = ".level-root",
  Organization = ".level-organization",
  Group = ".level-group",
  Repo = ".level-repo",
}

export class DevGuardPOM {
  readonly devGuardDomain = envConfig.devGuard.domain;

  constructor(public page: Page) {
    const loggingAnalyzer = new LoggingAnalyzer(page);

    page.on("close", () => {
      // expect(loggingAnalyzer.logs).toEqual([]); // todo!!
    });
  }

  async loadDevGuard() {
    await this.page.goto(this.devGuardDomain);
    await this.verifyOnDevGuardURL();
  }

  async clickOnUserIconInHeader() {
    await this.page.getByRole("link", { name: "OD", exact: true }).click();
  }

  async logout() {
    await this.clickOnUserIconInHeader();
    await this.page.getByRole("link", { name: "User Settings Logout" }).click();
  }

  async verifyOnDevGuardURL() {
    await expect(this.page).toHaveURL(new RegExp(`^${this.devGuardDomain}/`), {
      timeout: 15_000,
    });
  }

  async verifyOnDevGuardLoginURL() {
    await expect(this.page).toHaveURL(
      new RegExp(`^${this.devGuardDomain}/login`),
      { timeout: 15_000 },
    );
  }

  async loginWithOpenCode() {
    await this.page.goto(`${this.devGuardDomain}/login`);
    await this.page
      .getByRole("button", { name: "OpenCode Logo Sign in with" })
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  async registerWithEmailAndPassword(email:string, username: string, password: string) {
    await this.page.goto(`${this.devGuardDomain}/login`);
    await this.page.getByTestId('ory/screen/login/action/register').click();
    await this.page.getByTestId('traits.email').click();
    await this.page.getByTestId('traits.email').fill(email);
    await this.page.getByTestId('traits.name').click();
    await this.page.getByTestId('traits.name').fill(username);
    await this.page
      .getByRole("checkbox", { name: "I agree to the terms of use" })
      .click();
    await expect(
      this.page.getByRole("checkbox", { name: "I agree to the terms of use" }),
    ).toBeChecked();

    await this.page.getByRole("button", { name: "Sign up" }).click();
    await this.page.getByTestId('password-button').click();
    await this.page.getByTestId('password').fill(password);
    await this.page
      .getByRole("button", { name: "Sign up", exact: true })
      .click();

    console.log(
      "Registered user with email: " + username + " and password: " + password,
    );

    if (!this.devGuardDomain.includes("localhost")) {
      // email validation only for non-localhost deployments
      await expect(
        this.page.getByText(
          "An email containing a verification code has been sent to the email address you provided. If you have not received an email, check the spelling of the address and make sure to use the address you registered with.",
        ),
      ).toBeVisible({ timeout: 10_000 });

      console.log(
        "Please check your emails, enter the verification code and click on 'Continue'",
      );

      // await page.getByRole('textbox').click({timeout: 10_000});
      // await page.getByRole('textbox').fill(code);
      // await page.getByRole('button', { name: 'Continue' }).click();

      await expect(
        this.page.getByText("You successfully verified your email address."),
      ).toBeVisible({ timeout: 120_000 });

      await this.page
        .getByRole("button", { name: "Continue", exact: true })
        .click();
    }
  }

  async registerWithEmailwithoutVerification(
    username: string,
    password: string,
  ) {
    await this.page.goto(`${this.devGuardDomain}/login`);
    await this.page.getByRole("tab", { name: "Legacy Password Login" }).click();
    await this.page.getByRole("link", { name: "Sign up for free" }).click();
    await this.page.locator('input[name="traits.email"]').click();
    await this.page.locator('input[name="traits.email"]').fill(username);
    await this.page.locator('input[name="traits.name.first"]').click();
    await this.page.locator('input[name="traits.name.first"]').fill("Test");
    await this.page.locator('input[name="traits.name.last"]').click();
    await this.page.locator('input[name="traits.name.last"]').fill("User");
    await this.page
      .getByRole("checkbox", { name: "I agree to the terms of use" })
      .click();
    await expect(
      this.page.getByRole("checkbox", { name: "I agree to the terms of use" }),
    ).toBeChecked();

    await this.page.getByRole("button", { name: "Sign up" }).click();

    await expect(
      this.page.getByText(
        "Please choose a credential to authenticate yourself with.",
      ),
    ).toBeVisible({ timeout: 10_000 });
    await this.page.locator('input[name="password"]').click();
    await this.page.locator('input[name="password"]').fill(password);
    await this.page
      .getByRole("button", { name: "Sign up", exact: true })
      .click();

    console.log(
      "Registered user with email: " + username + " and password: " + password,
    );

    if (!this.devGuardDomain.includes("localhost")) {
      // email validation only for non-localhost deployments
      await expect(
        this.page.getByText(
          "An email containing a verification code has been sent to the email address you provided. If you have not received an email, check the spelling of the address and make sure to use the address you registered with.",
        ),
      ).toBeVisible({ timeout: 10_000 });

      console.log(
        "Please check your emails, enter the verification code and click on 'Continue'",
      );
    }
    // await this.page.getByRole('button', { name: 'Go back' }).click();
  }

  async createRepo(name: string, description: string) {
    await this.page
      .getByTestId("create-repository-button")
      .click({ timeout: 10_000 });
    await expect(
      this.page.getByTestId('repository-name'),
    ).toBeVisible();
    await this.page.getByTestId('repository-name').click();
    await this.page.getByTestId('repository-name').fill(name);
    await this.page.getByTestId('repository-description').click();
    await this.page
      .getByTestId('repository-description')
      .fill(description);
    await this.page.getByTestId('create-repository-submit-button').click();
  }

  async createGroup(name: string, description: string) {
    await this.page
      .getByTestId('create-group-button')
      .click({ timeout: 30_000 });
    await expect(
      this.page.getByTestId('group-name'),
    ).toBeVisible();
    await this.page.getByTestId('group-name').click();
    await this.page.getByTestId('group-name').fill(name);
    await this.page.getByTestId('group-description').click();
    await this.page
      .getByTestId('group-description')
      .fill(description);
    await this.page.getByTestId('create-group-submit-button').click();
  }

  async createOrganization(name: string) {
    await this.page
      .getByTestId('org-name-label')
      .click();
    await expect(
      this.page.getByRole("textbox", { name: "Organization name*" }),
    ).toBeVisible();
    await this.page
      .getByRole("textbox", { name: "Organization name*" })
      .fill(name);
    await this.page
      .getByRole("button", { name: "Create Organization" })
      .click();
  }

  async createTestOrganizationGroupAndRepo() {
    await this.createOrganization("Test Organization");
    await this.page.getByTestId('explore-button').click();
    await this.createGroup(
      "Test Group",
      "Test Group that contains very important projects!",
    );
    await this.createRepo(
      "Test Repo",
      "This repo contains top secret information. Without a Provider though..",
    );
  }

  async setupFlow_setupRiskScanning() {
    // setup risk scanning
    await this.page
      .getByTestId('setup-risk-scanning-button')
      .click();
    await this.page.waitForTimeout(500);
    await this.page
      .getByTestId('own-setup-card')
      .click();
    await this.page.getByTestId('scanner-selection-continue').click();
  }

  async setupFlow_selectManualUpload() {
    await this.page.waitForTimeout(500);
    await this.page
      .getByTestId('manual-upload-card')
      .click();
    await this.page.getByTestId('integration-method-selection-continue').click();
  }

  async setupFlow_uploadSbomFile(inputFile: string) {
    await this.page.waitForTimeout(500);
    await this.page.getByTestId('sbom-tab').click();
    await this.page
      .getByTestId("file-upload-input")
      .setInputFiles(inputFile);
    await this.page.getByTestId('manual-integration-continue').click();
  }

  async setupFlow_automatedCLI() {
    await this.page.waitForTimeout(500);
    await this.page
      .getByText("Use our CLIRecommendedUse the")
      .click({ timeout: 5_000 });
    await this.page
      .locator("#integration-method-selection-continue")
      .click({ timeout: 5_000 });
    await this.page
      .getByRole("button", { name: "Create Personal Access Token" })
      .click({ timeout: 5_000 });
    await this.page
      .getByRole("button", { name: "Copy" })
      .nth(4)
      .click({ timeout: 5_000 }); // todo.. find better way to select the correct copy button
    await this.page
      .locator("#automated-integration-continue")
      .click({ timeout: 5_000 });
  }

  async deleteRepo() {
    await this.page
      .locator(DevGuardNavigationLevel.Repo)
      .getByTestId("repository-settings")
      .click({ timeout: 5_000 });
    await this.page.getByTestId("delete-repository-button").click();
    await this.page.getByTestId("alert-confirm-button").click();
  }

  async testLightDarkSystemMode(level: DevGuardNavigationLevel) {
    await this.page
      .locator(level)
      .locator(".theme-chooser")
      .click({ timeout: 5_000 });
    await this.page
      .getByRole("menuitem", { name: "Dark" })
      .click({ timeout: 5_000 });
    await this.page.waitForTimeout(1_000);
    await this.page
      .locator(level)
      .locator(".theme-chooser")
      .click({ timeout: 5_000 });
    await this.page
      .getByRole("menuitem", { name: "System" })
      .click({ timeout: 5_000 });
    await this.page.waitForTimeout(1_000);
    await this.page
      .locator(level)
      .locator(".theme-chooser")
      .click({ timeout: 5_000 });
    await this.page
      .getByRole("menuitem", { name: "Light" })
      .click({ timeout: 5_000 });
  }

  async settingClickthroughRepo() {
    await this.page.getByTestId("repository-settings").click();
    await this.page.getByTestId('configure-security-requirements-button').click();
    await this.page.getByTestId('confidentiality-requirement-low').click();
    await this.page.getByTestId('integrity-requirement-high').click();
    await this.page.getByTestId('availability-requirement-low').click();
    await this.page.getByTestId('save-security-requirements-button').click(); 
    await this.page.getByTestId('enable-public-access-switch').click();
    await this.page.getByTestId('vuln-auto-reopen-switch').click();
    await this.page.getByTestId('save-vulnerability-management-settings-button').click();
  }

  async checkHeaderGroup() {
    await this.page
      .getByRole("link", { name: "Test Group" })
      .click({ timeout: 5_000 });
    await this.page.getByTestId("nav-group-overview").click();
    await this.page.getByTestId("nav-group-releases").click();
    await this.page.getByTestId("nav-group-subgroups-repositories").click();
    await this.page.getByTestId("nav-group-package-search").click();
    await this.page.getByTestId("nav-group-settings").click();
  }

  async createNewSubgroup() {
    await this.page.getByTestId("nav-group-subgroups-repositories").click();
    await this.page.getByTestId('create-subgroup-button').click();
    await this.page.getByTestId('group-name').fill("Test");
    await this.page.getByTestId('group-description').click();
    await this.page.getByTestId('group-description').fill("Test");
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async createNewArtifact(name: string, url: string) {
    await this.page.getByTestId("nav-asset-artifacts").click();
    await this.page
      .getByTestId("create-artifact-button")
      .click();
    await this.page.getByTestId("artifact-name-input").click();
    await this.page.getByTestId("artifact-name-input").fill(name);
    await this.page.getByTestId("sbom-url-upload-button").click();
    await this.page.getByTestId("upstream-url-field").click();
    await this.page.getByTestId("upstream-url-field").fill(url)
    await this.page.getByTestId("submit-artifact-button").click();
  }

  async deleteFirstArtifact() {
    await this.page.getByTestId("artifact-options-button").click();
    await this.page.getByTestId("delete-artifact-menu-item").click();
    await this.page.getByTestId("confirm-artifact-deletion").click();
  }
}
