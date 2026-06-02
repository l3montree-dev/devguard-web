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

    // setup risk scanning
    await devguardPOM.setup().setupFlow_setupRiskScanning();

    // select manual upload
    await devguardPOM.setup().setupFlow_selectManualUpload();

    // upload sbom file
    await devguardPOM.setup().setupFlow_uploadSbomFile(inputFile);

    // check one affected vuln
    await devguardPOM.vuln().openFirstAffectedComponent();

    // handle vuln to false positive
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

    await devguardPOM.setup().setupFlow_setupRiskScanning();

    await devguardPOM.setup().setupFlow_selectManualUpload();

    await devguardPOM.setup().setupFlow_uploadSbomFile(inputFile);

    await devguardPOM.vuln().openFirstAffectedComponent();

    await devguardPOM.vuln().markVulnAsAcceptedRisk();

    await page.waitForTimeout(2_000);
  });
});
