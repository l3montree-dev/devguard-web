// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";

test.describe("DevGuard handle vuln flows", () => {
  test("test sbom upload to false positive", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadAndRegister();
    await devguardPOM.createTestOrganizationGroupAndRepo();
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markVulnAsFalsePositive();
    await page.waitForTimeout(2_000);
  });

  test("test sbom upload to accepted risk", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadAndRegister();
    await devguardPOM.createTestOrganizationGroupAndRepo();
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().openFirstAffectedComponent();
    await devguardPOM.vuln().markVulnAsAcceptedRisk();
    await page.waitForTimeout(2_000);
  });

  test("test auto setup to gitlab repo", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadAndRegister();
    await devguardPOM.org().createOrganization("TestOrganization");
    await devguardPOM.group().createGroup("TestGroup", "This is a test group");
    await devguardPOM.repo().createGitLabRepo("TestRepo", "This is a test repo");
    await devguardPOM.setup().setupAutoRiskScanning();

    const gitlabToken = process.env.GITLAB_TOKEN;
    if (!gitlabToken) {
      throw new Error("GITLAB_TOKEN is not set in .env");
    }
    await devguardPOM.setup().createGitLabIntegration("My Token", "https://gitlab.com", gitlabToken);
    await devguardPOM.setup().selectGitLabRepo();
    await devguardPOM.setup().startAutoSetupGitLab();
  });

  test("test the filter possibilities of dependency risk page", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadAndRegister();
    await devguardPOM.createTestOrganizationGroupAndRepo();
    await devguardPOM.setupSbomUpload();
    await devguardPOM.vuln().filterDependencyRisksTable();
  });
});
