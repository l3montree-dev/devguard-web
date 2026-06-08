import type { Page } from "@playwright/test";
import { DevGuardNavigationLevel } from "../devguard";

export class OrgFlow {
  constructor(private page: Page) {}

  async createOrganization(name: string) {
    await this.page.getByTestId("org-name-label").click();
    await this.page
      .getByRole("textbox", { name: "Organization name*" })
      .waitFor({ state: "visible" });
    await this.page.getByRole("textbox", { name: "Organization name*" }).fill(name);
    await this.page.getByRole("button", { name: "Create Organization" }).click();
    const exploreButton = this.page.getByTestId("explore-button");
    try {
      await exploreButton.waitFor({ state: "visible", timeout: 5_000 });
      await exploreButton.click();
    } catch {
      // explore button not shown, continuing
    }
  }

  async inviteUserOrg(mail: string) {
    await this.page.getByTestId("nav-org-settings").click();
    await this.page.getByTestId("add-member-button").click();
    await this.page.getByTestId("mail-input").fill(mail);
    await this.page.getByTestId("invite-member-button").click({ timeout: 5_000 });
  }

  async createSecondOrganization(name: string, level: DevGuardNavigationLevel) {
    await this.page.locator(`${level} [data-testid="org-switcher-dropdown"]`).click();
    await this.page.getByTestId("create-new-organization-button").click();
    await this.createOrganization(name);
  }
}
