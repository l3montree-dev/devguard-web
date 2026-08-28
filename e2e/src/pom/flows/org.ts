// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { expect, test, type Page } from "@playwright/test";
import { DevGuardNavigationLevel } from "../devguard";
import { envConfig } from "../../utils";
import { docShot } from "../../doc-shot";

export class OrgFlow {
  constructor(private page: Page) {}

  async createOrganization(name: string) {
    await this.page.goto(`${envConfig.devGuard.domain}/setup`);
    // Necessary timeout so the 3D interactive DevGuard card is centered
    await this.page.waitForTimeout(1_000);
    await this.page.setViewportSize({ width: 1440, height: 900 });
    await docShot(this.page, test.info(), "org-creation-screen");
    await this.page.getByTestId("org-name-label").click();
    await this.page
      .getByRole("textbox", { name: "Organization name*" })
      .waitFor({ state: "visible" });
    await this.page
      .getByRole("textbox", { name: "Organization name*" })
      .fill(name);
    await this.page
      .getByRole("button", { name: "Create Organization" })
      .click();
    await this.page
      .getByTestId("create-group-submit-button")
      .waitFor({ state: "visible", timeout: 30_000 });
    await docShot(this.page, test.info(), "group-creation-screen");
  }

  async openGroups() {
    await this.page
      .locator(
        `${DevGuardNavigationLevel.Organization} [data-testid="nav-org-groups"]`,
      )
      .click({ timeout: 15_000 });
    await this.page
      .getByTestId("create-group-button")
      .or(this.page.getByTestId("create-group-form"))
      .first()
      .waitFor({ state: "visible", timeout: 15_000 });
  }

  async openGroup(groupName: string) {
    await this.page
      .getByRole("link", { name: groupName })
      .first()
      .click({ timeout: 30_000 });
    await this.page
      .getByTestId("nav-group-subgroups-repositories")
      .waitFor({ state: "visible", timeout: 30_000 });
  }

  async inviteUserOrg(mail: string) {
    await this.page.getByTestId("nav-org-settings").click();
    await this.page
      .getByTestId("add-member-button")
      .waitFor({ state: "visible", timeout: 10_000 });
    await this.page.getByTestId("add-member-button").click();
    await this.page.getByTestId("mail-input").fill(mail);
    await this.page
      .getByTestId("invite-member-button")
      .click({ timeout: 30_000 });
  }

  async inviteUserAndGetLink(mail: string): Promise<string> {
    await this.inviteUserOrg(mail);
    const linkSpan = this.page
      .locator("text=/accept-invitation\\?code=/")
      .first();
    await linkSpan.waitFor({ state: "visible", timeout: 30_000 });
    const rawText = await linkSpan.textContent();
    const match = rawText?.match(
      /(https?:\/\/[^\s]+\/accept-invitation\?code=[^\s]+)/,
    );
    if (!match) {
      throw new Error(`Could not extract invite URL from: ${rawText}`);
    }
    await this.page.keyboard.press("Escape");
    await this.page
      .getByTestId("mail-input")
      .waitFor({ state: "hidden", timeout: 30_000 });
    return match[1];
  }

  async verifyMemberInSettings(memberName: string) {
    await this.page.getByTestId("nav-org-settings").click();
    await this.page.reload();
    await expect(this.page.locator("tbody").getByText(memberName)).toBeVisible({
      timeout: 30_000,
    });
  }

  async memberToAdmin(memberName: string) {
    const row = this.page.locator("tr", {
      has: this.page.getByText(memberName),
    });
    await row.getByTestId("change-user-role").click();
    await this.page.getByTestId("make-user-admin").click();
  }

  async createSecondOrganization(name: string, level: DevGuardNavigationLevel) {
    await this.redirectToNewOrg(level);
    await this.page.getByTestId("org-name-label").click();
    await this.page
      .getByRole("textbox", { name: "Organization name*" })
      .waitFor({ state: "visible" });
    await this.page
      .getByRole("textbox", { name: "Organization name*" })
      .fill(name);
    await this.page
      .getByRole("button", { name: "Create Organization" })
      .click();
  }

  async redirectToNewOrg(level: DevGuardNavigationLevel) {
    try {
      await this.page
        .locator(".DialogOverlay")
        .waitFor({ state: "hidden", timeout: 10_000 });
    } catch {
      // no overlay present
    }
    await this.page
      .locator(`${level} [data-testid="org-switcher-dropdown"]`)
      .click();
    await this.page.getByTestId("create-new-organization-button").click();
  }

  async publishOrg() {
    await this.page.getByTestId("nav-org-settings").click();
    await this.page.getByTestId("public-org-switch").click();
  }
}
