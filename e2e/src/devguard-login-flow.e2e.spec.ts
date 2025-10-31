import { test, expect } from "@playwright/test";
import { describe } from "node:test";
import { DevGuardPOM } from "./pom/devguard";
import { envConfig } from "./utils";

describe("DevGuard Email login flows", () => {
  test("test registration using email (new user)", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    console.log(`Registering new user ${username}`);
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);
  });

  test("test registration with already existing user", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);

    await devguardPOM.page.locator("#user-nav-user").click();
    await page.waitForTimeout(500);
    await devguardPOM.page.locator("#user-nav-logout-button").click();

    // try to register again with the same username
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);

    await expect(
      devguardPOM.page.getByText(
        "An account with the same identifier (email, phone, username, ...) exists already.",
      ),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("test if registration fails if user already exists", async ({
    page,
  }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);

    await devguardPOM.page.locator("#user-nav-user").click();
    await page.waitForTimeout(500);
    await devguardPOM.page.locator("#user-nav-logout-button").click();

    // try to register again with the same username
    await devguardPOM.registerWithEmail(username, envConfig.devGuard.password);

    await expect(
      devguardPOM.page.getByText(
        "An account with the same identifier (email, phone, username, ...) exists already.",
      ),
    ).toBeVisible({ timeout: 10_000 });
  });
});
