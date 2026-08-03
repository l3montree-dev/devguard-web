// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM, DevGuardNavigationLevel } from "./pom/devguard";
import path from "path";
import { docShot } from "./doc-shot";

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("DevGuard handle vuln flows", () => {
  let devguardPOM: DevGuardPOM;
  let groupName: string;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    ({ groupName } = await devguardPOM.createTestOrganizationGroupAndRepo());
  });

  test.skip("test sbom upload to path vexxing and verification of vex rule", async ({
    page,
  }, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markEdgeAsDoesNotCallVulnerableFunction(testInfo);
    await devguardPOM.vuln().verifyVEXRule();
  });

  test.skip("test to download vex", async ({ page }, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM
      .vuln()
      .markEdgeAsDoesNotCallVulnerableFunction(testInfo, false);
    await devguardPOM.sharing().downloadVEXFile();
  });

  test.skip("test to upload VEX and verify", async () => {
    await devguardPOM.setupSbomUpload();
    const inputFile = path.join(__dirname, "../assets/", "vex.json");
    await devguardPOM.setup().uploadVEX(inputFile);
    await devguardPOM.vuln().verifyVEXRule();
  });

  test.skip("test to delete a vex rule", async ({}, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM
      .vuln()
      .markEdgeAsDoesNotCallVulnerableFunction(testInfo, false);
    await devguardPOM.vuln().expectVulnState("False Positive");

    await devguardPOM.vuln().deleteFirstVexRule(testInfo);

    await devguardPOM.vuln().expectVulnStateEventually("Open");
  });

  test("test vex rule recommendation on a second asset with the same sbom", async ({
    page,
  }, testInfo) => {
    // First asset: upload the SBOM and assess the vulnerability as a false positive.
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM
      .vuln()
      .markEdgeAsDoesNotCallVulnerableFunction(testInfo, false);

    // Second asset in the same group: upload the same SBOM.
    await devguardPOM.vuln().openGroups();
    await devguardPOM.org().openGroup(groupName);
    await devguardPOM.group().openSubgroupsAndRepositories();
    await devguardPOM
      .repo()
      .createGitHubRepo(
        `Test Repo B ${Date.now()}`,
        "Second asset sharing the same SBOM.",
      );
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();

    // The existing VEX rule from the first asset should now be recommended here.
    await devguardPOM.vuln().expectVexRuleRecommendationVisible(testInfo);
    await devguardPOM.vuln().createVexRuleFromRecommendation();
    await devguardPOM.vuln().expectVulnState("False Positive");
  });
});
