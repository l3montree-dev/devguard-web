// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("DevGuard compliance posture flows", () => {
  let devguardPOM: DevGuardPOM;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
  });

  test("test compliance postures on organization, group and repository level", async () => {
    // organization level
    await devguardPOM.org().createOrganization(`Test Org ${Date.now()}`);
    await devguardPOM.modal().dismissWelcomeModalIfPresent();
    await devguardPOM.modal().dismissToastIfPresent();
    await devguardPOM.compliance().openOrgCompliancePostures();

    // group level
    await devguardPOM.org().openGroups();
    await devguardPOM
      .group()
      .createGroup(
        `Test Group ${Date.now()}`,
        "Test Group that contains very important projects!",
      );
    await devguardPOM.compliance().openGroupCompliancePostures();

    // repo level
    await devguardPOM.group().openSubgroupsAndRepositories();
    await devguardPOM
      .repo()
      .createGitHubRepo(
        `Test Repo ${Date.now()}`,
        "This repo contains top secret information.",
      );
    await devguardPOM.setupSbomUpload();
    await devguardPOM.compliance().openRepoCompliancePostures();
  });
});
