// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import path from "path";
import { docShot } from "./doc-shot";

test.use({ viewport: { width: 1440, height: 1200 } });

test.describe("DevGuard handle vuln flows", () => {
  let devguardPOM: DevGuardPOM;
  let groupName: string;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    ({ groupName } = await devguardPOM.createTestOrganizationGroupAndRepo());
  });

  test("test sbom upload to path vexxing and verification of vex rule", async ({}, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markEdgeAsDoesNotCallVulnerableFunction(testInfo);
    await devguardPOM.vuln().verifyVEXRule();
  });

  test("test to download vex", async ({}, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM
      .vuln()
      .markEdgeAsDoesNotCallVulnerableFunction(testInfo, false);
    await devguardPOM.sharing().downloadVEXFile();
  });

  test("test to upload VEX and verify", async () => {
    await devguardPOM.setupSbomUpload();
    const inputFile = path.join(__dirname, "../assets/", "vex.json");
    await devguardPOM.setup().uploadVEX(inputFile);
    await devguardPOM.vuln().verifyVEXRule();
  });

  test("test to reopen a vulnerability once a fix is available", async ({}, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().acceptRiskViaVexRule();
    await devguardPOM.vuln().expectVulnState("Accepted");

    await devguardPOM.vuln().reopenVexRule(testInfo);
  });

  test.skip("test to delete a vex rule", async ({}, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM
      .vuln()
      .markEdgeAsDoesNotCallVulnerableFunction(testInfo, false);
    await devguardPOM.vuln().expectVulnState("False Positive");

    await devguardPOM.vuln().deleteFirstVexRule(testInfo);
  });

  test("test vex rule recommendation on a second asset with the same sbom", async ({}, testInfo) => {
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

  test.skip("test to use upstream vex url and sync it", async ({
    page,
  }, testInfo) => {
    await page.getByTestId("external-url-card").click();
    await page.getByTestId("artifact-name-input").click();
    await page.getByTestId("artifact-name-input").fill("DevGuardSBOM");
    await page.getByTestId("sbom-url-upload-button").click();
    await page.getByTestId("upstream-url-field").click();
    await page
      .getByTestId("upstream-url-field")
      .fill(
        "https://api.main.devguard.org/api/v1/public/e1f24270-6e68-4571-9168-9c151c639c97/refs/v1-4-0/artifacts/pkg%3Aoci%2Fdevguard%3Frepository_url%3Dghcr.io%2Fl3montree-dev%2Fdevguard%26arch%3Damd64%26tag%3Dv1.4.0-amd64/sbom.json/",
      );
    await page.getByTestId("setup-information-sources-create").click();
    await page.reload();
    await devguardPOM.repo().openDependencyRiskTable();
    await page.getByTestId("nav-asset-vex-rules").click({ timeout: 20_000 });
    await page.getByTestId("upstream-vex-sources-trigger").click();
    await page.getByTestId("vex-sources-add-button").click();
    await page.getByTestId("supply-vex-source-url").click();
    await page.getByTestId("vex-source-url-input").click();
    await page
      .getByTestId("vex-source-url-input")
      .fill(
        "https://api.main.devguard.org/api/v1/public/e1f24270-6e68-4571-9168-9c151c639c97/refs/v1-4-0/artifacts/pkg%3Aoci%2Fdevguard%3Frepository_url%3Dghcr.io%2Fl3montree-dev%2Fdevguard%26arch%3Damd64%26tag%3Dv1.4.0-amd64/vex.json/",
      );
    await page.getByTestId("add-vex-source-submit-button").click();
    await page.reload();
    await page.getByTestId("upstream-vex-sources-trigger").click();
    await page.getByTestId("vex-sources-sync-all-button").click();
    await page.reload();
    await docShot(page, testInfo, "upstream-vex-rules");
  });
});
