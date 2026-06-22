// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM, DevGuardNavigationLevel } from "./pom/devguard";
import path from "path";

test.describe("DevGuard handle vuln flows", () => {
  let devguardPOM: DevGuardPOM;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.createTestOrganizationGroupAndRepo();
  });

  test("test sbom upload to false positive", async () => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markVulnAsFalsePositive();
  });

  test("test sbom upload to path vexxing and verification of vex rule", async () => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markEdgeAsDoesNotCallVulnerableFunction();
    await devguardPOM.vuln().verifyVEXRule();
  });

  test("test sbom upload to accepted risk", async () => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markVulnAsAcceptedRisk();
  });

  test.skip("test auto setup to gitlab repo", async () => {
    await devguardPOM.org().redirectToNewOrg(DevGuardNavigationLevel.Organization);
    await devguardPOM.org().createOrganization("TestOrganizationGitLab");
    await devguardPOM.group().createGroup("TestGroupGitLab", "This is a test group");
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

  test("test to download vex", async () => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markEdgeAsDoesNotCallVulnerableFunction();
    await devguardPOM.sharing().downloadVEXFile();
  });

  test("test to upload VEX and verify", async () => {
    await devguardPOM.setupSbomUpload();
    const inputFile = path.join(__dirname, "../assets/", "vex.json");
    await devguardPOM.setup().uploadVEX(inputFile);
    await devguardPOM.vuln().verifyVEXRule();
  });
});
