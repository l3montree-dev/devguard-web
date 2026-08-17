import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("DevGuard custom webhook test", () => {
  let devguardPOM: DevGuardPOM;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
  });

  test("test custom webhook creation for org", async () => {
    //Create test organization
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);

    //Click on settings tab
    //Scroll down to webhook section
    await devguardPOM.webhook().openOrgWebhookSettings();

    //wait and take screenshot of webhook section to show location of webhook setting
    await devguardPOM.webhook().screenshotViewPort("webhook-section-org");

    //Click on Webhook creation button
    await devguardPOM.webhook().openCreateWebhookDialog();

    //Fill in the webhook creation form
    await devguardPOM.webhook().fillWebhookForm({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });

    //wait and take screenshot of form
    await devguardPOM
      .webhook()
      .screenshotWebhookDialog("webhook-creation-form-org");

    //Click on create button
    await devguardPOM.webhook().submitWebhookForm();

    //wait and take screenshot of the newly created webhook
    await devguardPOM.webhook().screenshotViewPort("webhook-created-org");
  });

  test("test custom webhook creation for group", async () => {
    //Create test group
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM.org().openGroups();
    await devguardPOM
      .group()
      .createGroup(
        `Test Group ${Date.now()}`,
        "Test Group that contains very important projects!",
      );

    //Click on settings tab
    //Scroll down to webhook section
    await devguardPOM.webhook().openGroupWebhookSettings();

    //Click on Webhook creation button
    await devguardPOM.webhook().openCreateWebhookDialog();

    //Fill in the webhook creation form
    await devguardPOM.webhook().fillWebhookForm({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });

    //Click on create button
    await devguardPOM.webhook().submitWebhookForm();
  });

  test("test custom webhook update for org", async () => {
    //Create test organization
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);

    //Click on settings tab
    //Scroll down to webhook section
    await devguardPOM.webhook().openOrgWebhookSettings();

    //Create a webhook
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });

    //wait and take screenshot of the newly created webhook to show state before update
    await devguardPOM.webhook().screenshotViewPort("webhook-before-update-org");

    //Click on the edit button of the newly created webhook
    await devguardPOM.webhook().openEditWebhookDialog(true);

    //Fill in the webhook update form
    await devguardPOM.webhook().fillWebhookForm({
      name: "My Updated Webhook",
      description: "Webhook updated during e2e testing",
      url: "https://example.com/updated-webhook",
    });

    //wait and take screenshot of the edit form
    await devguardPOM
      .webhook()
      .screenshotWebhookDialog("webhook-edit-form-org");

    //Click on update button
    await devguardPOM.webhook().submitWebhookForm();

    //wait and take screenshot of the updated webhook to show state after update
    await devguardPOM.webhook().screenshotViewPort("webhook-after-update-org");
  });

  test("test custom webhook update for group", async () => {
    //Create test group
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM.org().openGroups();
    await devguardPOM
      .group()
      .createGroup(
        `Test Group ${Date.now()}`,
        "Test Group that contains very important projects!",
      );

    //Click on settings tab
    //Scroll down to webhook section
    await devguardPOM.webhook().openGroupWebhookSettings();

    //Create a webhook
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });

    //Click on the edit button of the newly created webhook
    await devguardPOM.webhook().openEditWebhookDialog();

    //Fill in the webhook update form
    await devguardPOM.webhook().fillWebhookForm({
      name: "My Updated Webhook",
      description: "Webhook updated during e2e testing",
      url: "https://example.com/updated-webhook",
    });

    //Click on update button
    await devguardPOM.webhook().submitWebhookForm();
  });

  test("test custom webhook deletion for org", async () => {
    //Create test organization
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);

    //Click on settings tab
    //Scroll down to webhook section
    await devguardPOM.webhook().openOrgWebhookSettings();

    //Create a webhook
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });

    //Click on the edit button of the newly created webhook
    await devguardPOM.webhook().openEditWebhookDialog();

    //wait and take screenshot of the newly created webhook to show state before deletion

    await devguardPOM
      .webhook()
      .screenshotWebhookDialog("webhook-before-deletion-org");

    await devguardPOM
      .webhook()
      .screenshotWebhookDialogButtons("webhook-before-deletion-confirm-org");

    //Click on the delete button of the newly created webhook
    // Note: deleting a webhook currently deletes immediately - there is no
    // confirmation dialog in the UI, so the screenshot below captures the
    // resulting state right after the delete request completes.
    await devguardPOM.webhook().clickDeleteWebhook();

    //wait short and take screenshot of the confirmation modal
    await devguardPOM
      .webhook()
      .screenshotViewPort("webhook-after-deletion-org", 1_000);
  });

  test("test custom webhook deletion for group", async () => {
    //Create test group
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM.org().openGroups();
    await devguardPOM
      .group()
      .createGroup(
        `Test Group ${Date.now()}`,
        "Test Group that contains very important projects!",
      );

    //Click on settings tab
    //Scroll down to webhook section
    await devguardPOM.webhook().openGroupWebhookSettings();

    //Create a webhook
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });

    //Click on the edit button of the newly created webhook
    await devguardPOM.webhook().openEditWebhookDialog();

    //Click on the delete button of the newly created webhook
    // Note: deleting a webhook currently deletes immediately - there is no
    // confirmation dialog in the UI, so the screenshot below captures the
    // resulting state right after the delete request completes.
    await devguardPOM.webhook().clickDeleteWebhook();
  });

  test("test custom webhook test payload for org", async () => {
    //Create test organization
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);

    //Click on settings tab
    //Scroll down to webhook section
    await devguardPOM.webhook().openOrgWebhookSettings();

    //Create a webhook
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });

    //Click on the edit button of the newly created webhook
    await devguardPOM.webhook().openEditWebhookDialog();

    // Send Test Payload
    await devguardPOM.webhook().openTestPayloadDropDown();

    await devguardPOM
      .webhook()
      .screenshotViewPort("webhook-before-send-test-payload");

    await devguardPOM
      .webhook()
      .screenshotWebhookDialogButtons("webhook-before-confirm-test-payload");

    await devguardPOM.webhook().sendTestPayloadWebHook();

    await devguardPOM
      .webhook()
      .screenshotViewPort("webhook-after-send-test-payload", 2_000);
  });

  test("test custom webhook test payload for group", async () => {
    //Create test group
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM.org().openGroups();
    await devguardPOM
      .group()
      .createGroup(
        `Test Group ${Date.now()}`,
        "Test Group that contains very important projects!",
      );

    //Click on settings tab
    //Scroll down to webhook section
    await devguardPOM.webhook().openGroupWebhookSettings();

    //Create a webhook
    await devguardPOM.webhook().createWebhook({
      name: "My Test Webhook",
      description: "Webhook created for e2e testing",
      url: "https://example.com/webhook",
    });

    //Click on the edit button of the newly created webhook
    await devguardPOM.webhook().openEditWebhookDialog();

    // Send Test Payload
    await devguardPOM.webhook().openTestPayloadDropDown();

    await devguardPOM.webhook().sendTestPayloadWebHook();
  });
});
