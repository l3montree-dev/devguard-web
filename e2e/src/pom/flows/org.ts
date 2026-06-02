import type { Page } from "@playwright/test";

export class OrgFlow {
  constructor(private page: Page) {}

  async createOrganization(name: string) {
    await this.page.getByTestId("org-name-label").click();
    await this.page
      .getByRole("textbox", { name: "Organization name*" })
      .waitFor({ state: "visible" });
    await this.page.getByRole("textbox", { name: "Organization name*" }).fill(name);
    await this.page.getByRole("button", { name: "Create Organization" }).click();
    await this.page.getByTestId("explore-button").click();
  }

  async inviteUserOrg(mail: string) {
    await this.page.getByTestId("nav-org-settings").click();
    await this.page.getByTestId("add-member-button").click();
    await this.page.getByTestId("mail-input").fill(mail);
    await this.page.getByTestId("invite-member-button").click({ timeout: 5_000 });
  }
}
