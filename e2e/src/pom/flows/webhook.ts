// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test, type Page } from "@playwright/test";
import { docShot } from "../../doc-shot";
import { DevGuardNavigationLevel } from "../devguard";

export interface WebhookFormValues {
  name: string;
  description: string;
  url: string;
}

export class WebhookFlow {
  constructor(private page: Page) {}

  async openOrgWebhookSettings() {
    await this.openWebhookSettings(
      DevGuardNavigationLevel.Organization,
      "nav-org-settings",
    );
  }

  async openGroupWebhookSettings() {
    await this.openWebhookSettings(
      DevGuardNavigationLevel.Group,
      "nav-group-settings",
    );
  }

  private async openWebhookSettings(
    level: DevGuardNavigationLevel,
    settingsTestId: string,
  ) {
    const navItem = this.page.locator(
      `${level} [data-testid="${settingsTestId}"]`,
    );
    await navItem.waitFor({ state: "visible", timeout: 5_000 });
    await navItem.click({ timeout: 5_000 });

    await expect(this.page).toHaveURL(/\/settings/, { timeout: 10_000 });

    const webhookSection = this.page.getByTestId("webhooks-section");
    await webhookSection.scrollIntoViewIfNeeded();
    await this.page.mouse.wheel(0, 200);
  }

  async screenshotViewPort(name: string, waitMs = 2_000) {
    await this.page.waitForTimeout(waitMs);
    await docShot(this.page, test.info(), name);
  }

  async openCreateWebhookDialog() {
    await this.page.getByTestId("add-webhook-button").click();
    await this.page
      .getByTestId("webhook-name-input")
      .waitFor({ state: "visible", timeout: 5_000 });
  }

  async openEditWebhookDialog(screenshot: boolean = false) {
    await this.page.getByTestId("webhook-actions").click();
    if (screenshot) {
      await this.screenshotViewPort("webhook-edit-action-org");
    }
    await this.page.getByTestId("edit-webhook-button").click();
    await this.page
      .getByTestId("webhook-name-input")
      .waitFor({ state: "visible", timeout: 5_000 });
  }

  async fillWebhookForm(values: WebhookFormValues) {
    await this.page.getByTestId("webhook-name-input").fill(values.name);
    await this.page
      .getByTestId("webhook-description-input")
      .fill(values.description);
    await this.page.getByTestId("webhook-url-input").fill(values.url);
  }

  async screenshotWebhookDialog(name: string) {
    await this.page.waitForTimeout(2_000);
    await docShot(this.page, test.info(), name, {
      locator: this.page.getByRole("dialog"),
    });
  }

  async screenshotWebhookDialogButtons(name: string) {
    await this.page.waitForTimeout(2_000);
    await docShot(this.page, test.info(), name, {
      locator: this.page.getByTestId("webhook-edit-buttons"),
    });
  }

  async submitWebhookForm() {
    await this.page.getByTestId("webhook-submit-button").click();
    await this.page
      .getByRole("dialog")
      .waitFor({ state: "hidden", timeout: 15_000 });
  }

  async createWebhook(values: WebhookFormValues) {
    await this.openCreateWebhookDialog();
    await this.fillWebhookForm(values);
    await this.submitWebhookForm();
  }

  async clickDeleteWebhook() {
    await this.page.getByTestId("delete-webhook-button").click();
  }

  async openTestPayloadDropDown() {
    await this.page.getByTestId("test-webhook-payload").click();
  }

  async sendTestPayloadWebHook() {
    await this.page.getByTestId("test-webhook-payload-sbom").click();
  }
}
