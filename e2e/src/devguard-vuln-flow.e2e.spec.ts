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
    await devguardPOM.registerWithEmailAndPassword(email, username, envConfig.devGuard.password);

    await devguardPOM.createTestOrganizationGroupAndRepo();

    // set path for upload sample sbom
    const inputFile = path.join(__dirname, "../assets/", "sbom.json");
    console.log(`Usign SBOM from path: ${inputFile}`);

    // setup risk scanning
    await devguardPOM.setupFlow_setupRiskScanning();

    // select manual upload
    await devguardPOM.setupFlow_selectManualUpload();

    // upload sbom file
    await devguardPOM.setupFlow_uploadSbomFile(inputFile);

    // check one affected vuln
    await devguardPOM.openFirstAffectedComponent();

    // handle vuln to false positive
    await devguardPOM.markVulnAsFalsePositive();

    await page.waitForTimeout(2_000);
  });

  test("test sbom upload to accepted risk", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    console.log(`Registering new user ${username}`);
    await devguardPOM.registerWithEmailAndPassword(email, username, envConfig.devGuard.password);

    await devguardPOM.createTestOrganizationGroupAndRepo();

    // set path for upload sample sbom
    const inputFile = path.join(__dirname, "../assets/", "sbom.json");
    console.log(`Usign SBOM from path: ${inputFile}`);

    // setup risk scanning
    await devguardPOM.setupFlow_setupRiskScanning();

    // select manual upload
    await devguardPOM.setupFlow_selectManualUpload();

    // upload sbom file
    await devguardPOM.setupFlow_uploadSbomFile(inputFile);

    // check one affected vuln
    await devguardPOM.openFirstAffectedComponent();

    // handle vuln to risk accepted
    await devguardPOM.markVulnAsAcceptedRisk();

    await page.waitForTimeout(2_000);
  });
});
