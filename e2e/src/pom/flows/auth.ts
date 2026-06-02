import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export class AuthFlow {
  constructor(private page: Page, private domain: string) {}

  async loginWithEmailAndPassword(email: string, password: string) {
    await this.page.getByTestId("identifier").click();
    await this.page.getByTestId("identifier").fill(email);
    await this.page.getByTestId("password").click();
    await this.page.getByTestId("password").fill(password);
    await this.page.getByRole("button", { name: "Sign in with password" }).click();
  }

  async loginWithOpenCode() {
    await this.page.goto(`${this.domain}/login`);
    await this.page
      .getByRole("button", { name: "OpenCode Logo Sign in with" })
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  async registerWithEmailAndPassword(email: string, username: string, password: string) {
    await this.page.getByTestId("ory/screen/login/action/register").click();
    await this.page.getByTestId("traits.email").click();
    await this.page.getByTestId("traits.email").fill(email);
    await this.page.getByTestId("traits.name").click();
    await this.page.getByTestId("traits.name").fill(username);
    await this.page
      .getByRole("checkbox", { name: "I agree to the terms of use" })
      .click();
    await expect(
      this.page.getByRole("checkbox", { name: "I agree to the terms of use" }),
    ).toBeChecked();

    await this.page.getByRole("button", { name: "Sign up" }).click();
    await this.page.getByTestId("password-button").click();
    await this.page.getByTestId("password").fill(password);
    await this.page.getByRole("button", { name: "Sign up", exact: true }).click();

    console.log("Registered user with email: " + username + " and password: " + password);

    if (!this.domain.includes("localhost")) {
      await expect(
        this.page.getByText(
          "An email containing a verification code has been sent to the email address you provided. If you have not received an email, check the spelling of the address and make sure to use the address you registered with.",
        ),
      ).toBeVisible({ timeout: 10_000 });

      console.log("Please check your emails, enter the verification code and click on 'Continue'");

      await expect(
        this.page.getByText("You successfully verified your email address."),
      ).toBeVisible({ timeout: 120_000 });

      await this.page.getByRole("button", { name: "Continue", exact: true }).click();
    }
  }

  async logout() {
    const userSettings = this.page.locator(`.level-root [data-testid="user-nav-dropdown-trigger"]`);
    await userSettings.click();
    await this.page.getByTestId("user-nav-logout-button").waitFor({ state: "visible" });
    await this.page.getByTestId("user-nav-logout-button").click();
  }
}
