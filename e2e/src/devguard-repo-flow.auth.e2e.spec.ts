// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";

test.describe("DevGuard repo flows", () => {
  let devguardPOM: DevGuardPOM;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.createTestOrganizationGroupAndRepo();
  });
  
  test("test create, settings and delete (through settings) of repo", async ({
    page,
  }) => {
    await page.waitForTimeout(500);
    await devguardPOM.repo().settingClickthroughRepo();
    await devguardPOM.repo().deleteRepo();
  });

  test("test manual sbom upload", async ({ page }) => {
    await devguardPOM.setupSbomUpload();
    await page.waitForTimeout(2_000);
  });

  test("test if we can add artifact manually", async ({ page }) => {
    await page.waitForTimeout(500);
    await devguardPOM.setupSbomUpload();
    await devguardPOM
      .artifacts()
      .createNewArtifact(
        "pkg:test/artifact",
        "http://github.com/user-attachments/files/23216827/vex_l3montree_web_reopened.json",
      );
    await page.waitForTimeout(1_000);
    await devguardPOM.artifacts().deleteFirstArtifact();
    await page.waitForTimeout(1_000);
    await devguardPOM.artifacts().deleteFirstArtifact();
    await page
      .getByRole("heading", { name: "No Artifacts Available" })
      .isVisible();
  });
});
