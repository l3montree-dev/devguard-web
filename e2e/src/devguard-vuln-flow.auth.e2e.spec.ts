// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM, DevGuardNavigationLevel } from "./pom/devguard";
import path from "path";
import { docShot } from "./doc-shot";

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("DevGuard handle vuln flows", () => {
  let devguardPOM: DevGuardPOM;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.createTestOrganizationGroupAndRepo();
  });

  test("test sbom upload to false positive", async ({ page }, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await docShot(page, testInfo, "dependency-risk-table");
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markVulnAsFalsePositive();
  });

  test("test sbom upload to accepted risk", async () => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markVulnAsAcceptedRisk();
  });

  test("test sbom upload to overview", async ({ page }, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await page.getByTestId("nav-asset-overview").click();
    await docShot(page, testInfo, "asset-overview");
    await page.mouse.wheel(0, 1000);
    await docShot(page, testInfo, "asset-overview-v2");
  });

  test.skip("test auto setup to gitlab repo", async () => {
    await devguardPOM
      .org()
      .redirectToNewOrg(DevGuardNavigationLevel.Organization);
    await devguardPOM.org().createOrganization("TestOrganizationGitLab");
    await devguardPOM
      .group()
      .createGroup("TestGroupGitLab", "This is a test group");
    await devguardPOM
      .repo()
      .createGitLabRepo("TestRepoGitLab", "This is a test repo");
    await devguardPOM.setup().setupAutoRiskScanning();

    const gitlabToken = process.env.GITLAB_TOKEN;
    if (!gitlabToken) {
      test.skip(
        true,
        "GITLAB_TOKEN is not set — skipping GitLab integration test",
      );
      return;
    }
    await devguardPOM
      .setup()
      .createGitLabIntegration("My Token", "https://gitlab.com", gitlabToken);
    await devguardPOM.setup().selectGitLabRepo();
    await devguardPOM.setup().startAutoSetupGitLab();
  });

  test("test the filter possibilities of dependency risk page", async () => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().filterDependencyRisksTable();
  });

  test("test to download sbom", async () => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.sharing().downloadSBOMFile();
  });
});
