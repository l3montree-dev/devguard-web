import { expect, type Page } from "@playwright/test";
import { DevGuardNavigationLevel } from "../devguard";

export class OrgFlow {
  constructor(private page: Page) {}

  async dismissWelcomeModalIfPresent() {
    const exploreButton = this.page.getByTestId("explore-button");
    try {
      await exploreButton.waitFor({ state: "visible", timeout: 5_000 });
      await exploreButton.click();
    } catch {
      // welcome modal not shown, continuing
    }
  }

  async createOrganization(name: string) {
    await this.page.getByTestId("org-name-label").click();
    await this.page
      .getByRole("textbox", { name: "Organization name*" })
      .waitFor({ state: "visible" });
    await this.page.getByRole("textbox", { name: "Organization name*" }).fill(name);
    await this.page.getByRole("button", { name: "Create Organization" }).click();
    await this.dismissWelcomeModalIfPresent();
  }

  async inviteUserOrg(mail: string) {
    await this.page.getByTestId("nav-org-settings").click();
    await this.page.getByTestId("add-member-button").click();
    await this.page.getByTestId("mail-input").fill(mail);
    await this.page.getByTestId("invite-member-button").click({ timeout: 5_000 });
  }

  async inviteUserAndGetLink(mail: string): Promise<string> {
    await this.inviteUserOrg(mail);
    const linkSpan = this.page.locator("text=/accept-invitation\\?code=/").first();
    await linkSpan.waitFor({ state: "visible", timeout: 10_000 });
    const rawText = await linkSpan.textContent();
    const match = rawText?.match(/(https?:\/\/[^\s]+\/accept-invitation\?code=[^\s]+)/);
    if (!match) {
      throw new Error(`Could not extract invite URL from: ${rawText}`);
    }
    await this.page.keyboard.press("Escape");
    await this.page.getByTestId("mail-input").waitFor({ state: "hidden", timeout: 5_000 });
    return match[1];
  }

  async verifyMemberInSettings(memberName: string) {
    await this.page.getByTestId("nav-org-settings").click();
    await this.page.reload();
    await expect(this.page.locator("tbody").getByText(memberName)).toBeVisible({ timeout: 15_000 });
  }

  async memberToAdmin(memberName: string) {
    const row = this.page.locator("tr", { has: this.page.getByText(memberName) });
    await row.getByTestId("change-user-role").click();
    await this.page.getByTestId("make-user-admin").click();
  }

  async createSecondOrganization(name: string, level: DevGuardNavigationLevel) {
    await this.page.locator(`${level} [data-testid="org-switcher-dropdown"]`).click();
    await this.page.getByTestId("create-new-organization-button").click();
    await this.createOrganization(name);
  }
}
