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

  test("test sbom upload to path vexxing and verification of vex rule", async ({
    page,
  }, testInfo) => {
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markEdgeAsDoesNotCallVulnerableFunction(testInfo);
    await devguardPOM.vuln().verifyVEXRule();
  });

  test("test to download vex", async ({ page }, testInfo) => {
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

  test("test to delete a vex rule", async ({}, testInfo) => {
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

  test("test to use upstream vex url and sync it", async ({
    page,
  }, testInfo) => {
    await page.getByTestId("supplier-url-card").click();
    await page.getByTestId("artifact-name-input").click();
    await page.getByTestId("artifact-name-input").fill("DevGuardSBOM");
    await page.getByTestId("sbom-url-upload-button").click();
    await page.getByTestId("upstream-url-field").click();
    await page
      .getByTestId("upstream-url-field")
      .fill(
        "https://api.main.devguard.org/api/v1/public/169319b7-8170-469f-9e31-f87b6054e507/refs/v1-10-0/artifacts/pkg%3Aoci%2Fdevguard-web%3Frepository_url%3Dghcr.io%2Fl3montree-dev%2Fdevguard-web%26arch%3Darm64%26tag%3Dv1.10.0-arm64/sbom.json/",
      );
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.reload();
    await page
      .getByTestId("nav-asset-dependency-risks")
      .locator("button")
      .click({ timeout: 20_000 });
    await page.getByTestId("nav-asset-vex-rules").click({ timeout: 20_000 });
    await page
      .getByRole("button", { name: "Your additional Upstream VEX" })
      .click();
    await page.getByRole("button", { name: "Add source" }).click();
    await page.getByText("Supply a source URLConfigure").click();
    await page.getByRole("textbox", { name: "VEX Source URL" }).click();
    await page
      .getByRole("textbox", { name: "VEX Source URL" })
      .fill(
        "https://api.main.devguard.org/api/v1/public/169319b7-8170-469f-9e31-f87b6054e507/refs/v1-10-0/artifacts/pkg%3Aoci%2Fdevguard-web%3Frepository_url%3Dghcr.io%2Fl3montree-dev%2Fdevguard-web%26arch%3Darm64%26tag%3Dv1.10.0-arm64/vex.json/",
      );
    await page.getByRole("button", { name: "Add VEX source" }).click();
    await page.reload();
    await page
      .getByRole("button", { name: "Your additional Upstream VEX" })
      .click();
    await page.getByRole("button", { name: "Sync all sources" }).click();
    await page.reload();
    await page.waitForTimeout(5_000);
    await docShot(page, testInfo, "upstream-vex-rules");
    await page.waitForTimeout(5_000);
  });
});
