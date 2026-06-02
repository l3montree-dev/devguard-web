// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
import { test } from "@playwright/test";
import { describe } from "node:test";
import { DevGuardPOM } from "./pom/devguard";
import { envConfig } from "./utils";
import path from "path";

describe("DevGuard handle vuln flows", () => {
  test("test sbom upload to false positive", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    console.log(`Registering new user ${username}`);
    await devguardPOM.auth().registerWithEmailAndPassword(email, username, envConfig.devGuard.password);

    await devguardPOM.createTestOrganizationGroupAndRepo();

    // set path for upload sample sbom
    const inputFile = path.join(__dirname, "../assets/", "sbom.json");
    console.log(`Usign SBOM from path: ${inputFile}`);

    await devguardPOM.setup().setupOwnRiskScanning();

    await devguardPOM.setup().selectManualUpload();

    await devguardPOM.setup().uploadSbomFile(inputFile);

    await devguardPOM.vuln().openFirstAffectedComponent();

    await devguardPOM.vuln().markVulnAsFalsePositive();

    await page.waitForTimeout(2_000);
  });

  test("test sbom upload to accepted risk", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    console.log(`Registering new user ${username}`);
    await devguardPOM.auth().registerWithEmailAndPassword(email, username, envConfig.devGuard.password);

    await devguardPOM.createTestOrganizationGroupAndRepo();

    // set path for upload sample sbom
    const inputFile = path.join(__dirname, "../assets/", "sbom.json");
    console.log(`Usign SBOM from path: ${inputFile}`);

    await devguardPOM.setup().setupOwnRiskScanning();

    await devguardPOM.setup().selectManualUpload();

    await devguardPOM.setup().uploadSbomFile(inputFile);

    await devguardPOM.vuln().openFirstAffectedComponent();

    await devguardPOM.vuln().markVulnAsAcceptedRisk();

    await page.waitForTimeout(2_000);
  });

  test("test auto setup to gitlab repo", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    console.log(`Registering new user ${username}`);
    await devguardPOM.auth().registerWithEmailAndPassword(email, username, envConfig.devGuard.password);

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
});
