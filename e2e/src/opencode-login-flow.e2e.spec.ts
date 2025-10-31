import { test, expect } from "@playwright/test";
import { describe } from "node:test";
import { OpenCodePOM } from "./pom/opencode";
import { DevGuardPOM } from "./pom/devguard";
import { loginToDevGuardUsingOpenCode, TEMPORARY_WORKAROUND } from "./utils";

describe("DevGuard <-> OpenCode login / logout flows", () => {
  test.beforeEach(async ({ page }) => {
    const openCodePOM = new OpenCodePOM(page);
    // login to openCode and make sure we don't have authorized DevGuard yet
    await openCodePOM.login(true); // complete login via openCode with redirect to openCode
    await openCodePOM.revokeAppAccess();
    await openCodePOM.logout();
  });

  test("test login flow with missing initial authorization", async ({
    page,
  }) => {
    const devguardPOM = new DevGuardPOM(page);
    const openCodePOM = new OpenCodePOM(page);

    await loginToDevGuardUsingOpenCode(page);

    await TEMPORARY_WORKAROUND(page, devguardPOM);

    // check if login was successful
    await expect(
      page.getByText("Here you will see all your groups"),
    ).toBeVisible();

    // await page.waitForTimeout(120_000);
    // TODO.. test if we are logged in

    await page.waitForTimeout(5_000);

    // open openCode again
    await openCodePOM.loadOpenCode();

    // revoke application access
    await openCodePOM.revokeAppAccess();

    // logout from openCode
    await openCodePOM.logout();

    // navigate back to devguard
    await devguardPOM.loadDevGuard();

    await page.waitForLoadState("networkidle");
    // await page.waitForTimeout(120_000);
  });
});
