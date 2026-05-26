// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import path from "path";
import { DevGuardPOM } from "./pom/devguard";
import { loginToDevGuardUsingOpenCode } from "./utils";

async function setupGroupRepoAndScanning(
  pom: DevGuardPOM,
  groupName: string,
  repoName: string,
) {
  await loginToDevGuardUsingOpenCode(pom.page);
  await pom.createGroup(groupName, "Temporary E2E test group");
  await pom.createRepo(repoName, "Temporary E2E test repository");
  await pom.setupFlow_setupRiskScanning();
  await pom.setupFlow_selectManualUpload();
}

async function cleanupRepoAndGroup(pom: DevGuardPOM) {
  try {
    await pom.deleteRepo();
  } catch (e) {
    console.warn("Repo cleanup failed:", e);
  }
  try {
    await pom.deleteGroup();
  } catch (e) {
    console.warn("Group cleanup failed:", e);
  }
}

test.describe("SBOM scanning", () => {
  test("can reach the manual file upload step via the setup flow", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();

    await loginToDevGuardUsingOpenCode(page);
    await pom.createGroup(`E2E Group ${id}`, "Temporary E2E test group");
    await pom.createRepo(`E2E Repo ${id}`, "Temporary E2E test repository");

    try {
      await pom.setupFlow_setupRiskScanning();
      await pom.setupFlow_selectManualUpload();

      // after selecting manual upload, the file upload input should be present
      await expect(
        page.locator("#file-upload-sbom input"),
      ).toBeAttached({ timeout: 10_000 });
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  test("can upload an SBOM file and proceed past the upload step", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const repoName = `E2E Repo ${id}`;
    const sbomFile = path.join(__dirname, "../assets/sbom.json");

    await setupGroupRepoAndScanning(pom, groupName, repoName);

    try {
      await pom.setupFlow_uploadSbomFile(sbomFile);

      // after upload, the wizard advances — the upload input should be gone
      await expect(
        page.locator("#file-upload-sbom input"),
      ).not.toBeAttached({ timeout: 10_000 });
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  test("can set up automated CLI scanning and generate a PAT", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const repoName = `E2E Repo ${id}`;

    await loginToDevGuardUsingOpenCode(page);
    await pom.createGroup(groupName, "Temporary E2E test group");
    await pom.createRepo(repoName, "Temporary E2E test repository");

    try {
      await pom.setupFlow_setupRiskScanning();

      // choose automated CLI instead of manual
      await page
        .getByText("Use our CLIRecommendedUse the")
        .click({ timeout: 5_000 });
      await page
        .locator("#integration-method-selection-continue")
        .click({ timeout: 5_000 });

      await page
        .getByRole("button", { name: "Create Personal Access Token" })
        .click({ timeout: 5_000 });

      // a token value should appear on screen
      await expect(
        page.getByRole("button", { name: "Copy" }).first(),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });
});
