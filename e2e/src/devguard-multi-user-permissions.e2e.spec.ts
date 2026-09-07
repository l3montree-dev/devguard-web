// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { envConfig } from "./utils";

test.skip(({ browserName }) => browserName !== "chromium", "chromium only");

test.describe("DevGuard multi-user: test flows", () => {
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

    await page2.getByTestId("join-organization").click();
    await page2.getByTestId("join-org-url").click();
    await page2.getByTestId("join-org-url").fill(inviteUrl);
    await page2.getByTestId("join-organization-dialog").click();

    await context2.close();

    await user1POM.org().verifyMemberInSettings(username2);

    await user1POM.org().memberToAdmin(username2);
  });

  test("test create org, project, asset and set them public and access them", async ({
    page,
    browser,
  }) => {
    const orgName = `publicorg-${Date.now()}`;
    const projectName = `publicproject-${Date.now()}`;
    const assetName = `publicasset-${Date.now()}`;
    const user1POM = new DevGuardPOM(page);
    const devGuardDomain: string = await user1POM.getCurrentDevGuardURL();
    const withoutPrefix = devGuardDomain.replace("http://", "");

    await user1POM.loadAndRegister();
    await user1POM.org().createOrganization(orgName);
    await user1POM.org().publishOrg();
    await user1POM.org().openGroups();
    await user1POM.group().createGroup(projectName, "This is a public group.");
    await user1POM.group().publishGroup();
    await user1POM.group().openSubgroupsAndRepositories();
    await user1POM.repo().createGitHubRepo(assetName, "This is a public repo.");
    await user1POM.setupSbomUpload();
    await user1POM.repo().publishRepo();

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    const user2POM = new DevGuardPOM(page2);

    await user2POM.loadAndRegister();

    await page2.goto(
      `${withoutPrefix}/${orgName}/projects/${projectName}/assets/${assetName}`,
    );
    await page2
      .getByTestId("download-pdf-report")
      .waitFor({ state: "visible", timeout: 15_000 });
  });
});
