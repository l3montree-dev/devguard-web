// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { envConfig } from "./utils";

test.describe("DevGuard multi-user: invite and permission flow", () => {
  test("invited user can join organization via invite link", async ({
    page,
    browser,
  }) => {
    const user1POM = new DevGuardPOM(page);
    await user1POM.loadAndRegister();
    await user1POM.org().createOrganization("MultiUserTestOrg");

    const invitedEmail = envConfig.devGuard.uniqueEMail();
    const inviteUrl = await user1POM.org().inviteUserAndGetLink(invitedEmail);

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    const user2POM = new DevGuardPOM(page2);

    await user2POM.loadDevGuard();

    const username2 = envConfig.devGuard.uniqueUsername();
    await user2POM
      .auth()
      .registerWithEmailAndPassword(
        invitedEmail,
        username2,
        envConfig.devGuard.password,
      );

    await page2.goto(inviteUrl);
    await page2.waitForURL(
      new RegExp(
        `^${envConfig.devGuard.domain}/(?!setup|accept-invitation)[^/]+`,
      ),
      { timeout: 20_000 },
    );
    await user2POM.org().dismissWelcomeModalIfPresent();

    await context2.close();

    await user1POM.org().verifyMemberInSettings(username2);

    await user1POM.org().memberToAdmin(username2);
  });
});
