// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
import { test } from "@playwright/test";
import { describe } from "node:test";
import { DevGuardPOM } from "./pom/devguard";
import { envConfig } from "./utils";
import path from "path";

describe("DevGuard repo flows", () => {
  test("test create, settings and delete (through settings) of repo", async ({
    page,
  }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    console.log(`Registering new user ${username}`);
    await devguardPOM.registerWithEmailAndPassword(email, username, envConfig.devGuard.password);

    await devguardPOM.createTestOrganizationGroupAndRepo();
    await page.waitForTimeout(500);

    // Check Setting Functionalities
    await devguardPOM.settingClickthroughRepo();

    // Delete Repo through Settings Page
    await devguardPOM.deleteRepo();
  });

  test("test manual sbom upload", async ({ page }) => {
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

    await page.waitForTimeout(2_000);
  });

  test("test if we can add artifact manually", async ({ page }) => {
    const devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    console.log(`Registering new user ${username}`);
    await devguardPOM.registerWithEmailAndPassword(email, username, envConfig.devGuard.password);

    await devguardPOM.createTestOrganizationGroupAndRepo();
    await page.waitForTimeout(500);

    // set path for upload sample sbom
    const inputFile = path.join(__dirname, "../assets/", "sbom.json");
    console.log(`Usign SBOM from path: ${inputFile}`);

    await devguardPOM.setupFlow_setupRiskScanning();
    await devguardPOM.setupFlow_selectManualUpload();
    await devguardPOM.setupFlow_uploadSbomFile(inputFile);

    await devguardPOM.createNewArtifact(
      "pkg:test/artifact",
      "http://github.com/user-attachments/files/23216827/vex_l3montree_web_reopened.json",
    );
    await page.waitForTimeout(1_000);
    await devguardPOM.deleteFirstArtifact();
    await page.waitForTimeout(1_000);
    await devguardPOM.deleteFirstArtifact();
    await page
      .getByRole("heading", { name: "No Artifacts Available" })
      .isVisible();
  });
});
