import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { docShot } from "./doc-shot";

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("DevGuard custom webhook test", () => {
  let devguardPOM: DevGuardPOM;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuardNoSuppress();
  });

  test("test custom webhook creation for org", async ({ page }, testInfo) => {
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM.webhook().openOrgWebhookSettings();
    await docShot(page, testInfo, "webhook-section-org");
    await devguardPOM.webhook().openCreateWebhookDialog();
    await devguardPOM.webhook().fillWebhookForm({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });
    await docShot(page, testInfo, "webhook-creation-form-org", {
      locator: page.getByRole("dialog"),
    });
    await devguardPOM.webhook().submitWebhookForm();
    await docShot(page, testInfo, "webhook-created-org");
  });

  test("test custom webhook creation for group", async () => {
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM
      .group()
      .createGroup(
        `Test Group ${Date.now()}`,
        "Test Group that contains very important projects!",
      );
    await devguardPOM.webhook().openGroupWebhookSettings();
    await devguardPOM.webhook().openCreateWebhookDialog();
    await devguardPOM.webhook().fillWebhookForm({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });
    await devguardPOM.webhook().submitWebhookForm();
  });

  test("test custom webhook update for org", async ({ page }, testInfo) => {
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM.webhook().openOrgWebhookSettings();
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });
    await docShot(page, testInfo, "webhook-before-update-org");
    await devguardPOM.webhook().openEditWebhookDialog(true);
    await devguardPOM.webhook().fillWebhookForm({
      name: "My Updated Webhook",
      description: "Webhook updated during e2e testing",
      url: "https://example.com/updated-webhook",
    });
    await docShot(page, testInfo, "webhook-edit-form-org", {
      locator: page.getByRole("dialog"),
    });
    await devguardPOM.webhook().submitWebhookForm();
    await docShot(page, testInfo, "webhook-after-update-org");
  });

  test("test custom webhook update for group", async () => {
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM
      .group()
      .createGroup(
        `Test Group ${Date.now()}`,
        "Test Group that contains very important projects!",
      );
    await devguardPOM.webhook().openGroupWebhookSettings();
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });
    await devguardPOM.webhook().openEditWebhookDialog();
    await devguardPOM.webhook().fillWebhookForm({
      name: "My Updated Webhook",
      description: "Webhook updated during e2e testing",
      url: "https://example.com/updated-webhook",
    });
    await devguardPOM.webhook().submitWebhookForm();
  });

  test("test custom webhook deletion for org", async ({ page }, testInfo) => {
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM.webhook().openOrgWebhookSettings();
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });
    await devguardPOM.webhook().openEditWebhookDialog();
    await docShot(page, testInfo, "webhook-edit-buttons", {
      locator: page.getByTestId("webhook-edit-buttons"),
    });
    await page.getByTestId("delete-webhook-button").click();
    await docShot(page, testInfo, "webhook-after-deletion-org");
  });

  test("test custom webhook deletion for group", async ({ page }) => {
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM
      .group()
      .createGroup(
        `Test Group ${Date.now()}`,
        "Test Group that contains very important projects!",
      );
    await devguardPOM.webhook().openGroupWebhookSettings();
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });
    await devguardPOM.webhook().openEditWebhookDialog();
    await page.getByTestId("delete-webhook-button").click();
  });

  test("test custom webhook test payload for org", async ({
    page,
  }, testInfo) => {
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM.webhook().openOrgWebhookSettings();
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });
    await devguardPOM.webhook().openEditWebhookDialog();
    await page.getByTestId("test-webhook-payload").click();
    await docShot(page, testInfo, "webhook-before-send-test-payload");
    await page.getByTestId("test-webhook-payload-sbom").click();
    await docShot(page, testInfo, "webhook-after-send-test-payload");
  });

  test("test custom webhook test payload for group", async ({ page }) => {
    //Create test group
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM
      .group()
      .createGroup(
        `Test Group ${Date.now()}`,
        "Test Group that contains very important projects!",
      );
    await devguardPOM.webhook().openGroupWebhookSettings();
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });
    await devguardPOM.webhook().openEditWebhookDialog();
    await page.getByTestId("test-webhook-payload").click();
    await page.getByTestId("test-webhook-payload-sbom").click();
  });
});
