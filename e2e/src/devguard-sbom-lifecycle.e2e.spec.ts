// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import path from "path";
import { DevGuardPOM } from "./pom/devguard";
import { loginToDevGuardUsingOpenCode } from "./utils";

// After a successful SBOM upload the app automatically navigates to the
// dependency-risks page and the setup dialog closes.
async function uploadSbomAndReachDependencies(
  pom: DevGuardPOM,
  groupName: string,
  repoName: string,
) {
  const sbomFile = path.join(__dirname, "../assets/sbom.json");

  await loginToDevGuardUsingOpenCode(pom.page);
  await pom.createGroup(groupName, "Temporary E2E test group");
  await pom.createRepo(repoName, "Temporary E2E test repository");
  await pom.setupFlow_setupRiskScanning();
  await pom.setupFlow_selectManualUpload();
  await pom.setupFlow_uploadSbomFile(sbomFile);

  // the dialog closes and navigates to dependency-risks — wait for that URL
  await expect(pom.page).toHaveURL(/dependency-risks/, { timeout: 30_000 });

  // navigate to the Dependencies page via the asset sidebar
  await pom.page
    .getByRole("link", { name: "Dependencies" })
    .click({ timeout: 10_000 });
  await expect(pom.page).toHaveURL(/dependencies/, { timeout: 10_000 });
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

test.describe("SBOM lifecycle — upload, download and VeX", () => {
  test("redirects to dependency-risks after a successful SBOM upload", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();

    await loginToDevGuardUsingOpenCode(page);
    await pom.createGroup(`E2E Group ${id}`, "Temporary E2E test group");
    await pom.createRepo(`E2E Repo ${id}`, "Temporary E2E test repository");
    await pom.setupFlow_setupRiskScanning();
    await pom.setupFlow_selectManualUpload();

    const sbomFile = path.join(__dirname, "../assets/sbom.json");

    try {
      await pom.setupFlow_uploadSbomFile(sbomFile);

      await expect(page).toHaveURL(/dependency-risks/, { timeout: 30_000 });
      await expect(
        page.getByText("SBOM has successfully been sent!"),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  test("can open the SBOM download modal from the Dependencies page", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const repoName = `E2E Repo ${id}`;

    await uploadSbomAndReachDependencies(pom, groupName, repoName);

    try {
      await page
        .getByRole("button", { name: "Download SBOM" })
        .click({ timeout: 5_000 });

      // dialog header should appear
      await expect(
        page.getByRole("dialog").getByText(/Download SBOM for/),
      ).toBeVisible({ timeout: 5_000 });

      // machine-readable formats section
      await expect(
        page.getByText("Machine Readable Formats"),
      ).toBeVisible();

      // CycloneDX JSON download option
      await expect(
        page.getByRole("link", { name: "Download in JSON-Format" }),
      ).toBeVisible();

      // XML download option
      await expect(
        page.getByRole("link", { name: "Download in XML-Format" }),
      ).toBeVisible();

      // PDF/UA download option
      await expect(
        page.getByRole("button", { name: "Download in PDF/UA-Format" }),
      ).toBeVisible();
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  test("can open the VeX download modal from the Dependencies page", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const repoName = `E2E Repo ${id}`;

    await uploadSbomAndReachDependencies(pom, groupName, repoName);

    try {
      await page
        .getByRole("button", { name: "Download VeX" })
        .click({ timeout: 5_000 });

      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
      await expect(
        page.getByRole("dialog").getByText(/VeX/i),
      ).toBeVisible();
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  test("can download the SBOM as CycloneDX JSON from the modal", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const repoName = `E2E Repo ${id}`;

    await uploadSbomAndReachDependencies(pom, groupName, repoName);

    try {
      await page
        .getByRole("button", { name: "Download SBOM" })
        .click({ timeout: 5_000 });

      // select an artifact first (required for the download to be active)
      const artifactItems = page
        .getByRole("dialog")
        .locator('[role="option"], [data-value]');
      const firstArtifact = artifactItems.first();
      if (await firstArtifact.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await firstArtifact.click();
      }

      // intercept the download — the link triggers a file download
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 30_000 }),
        page.getByRole("link", { name: "Download in JSON-Format" }).click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/sbom\.json/i);
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  test("can re-upload an SBOM on an existing repository via Setup Risk Scanning", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const repoName = `E2E Repo ${id}`;
    const sbomFile = path.join(__dirname, "../assets/sbom.json");

    await uploadSbomAndReachDependencies(pom, groupName, repoName);

    try {
      // navigate back to repo overview (Setup Risk Scanning button)
      await page
        .getByRole("link", { name: "Overview" })
        .click({ timeout: 5_000 });

      // the repo already has refs — open the risk scanner dialog again
      await page
        .getByRole("button", { name: "Setup Risk Scanning" })
        .click({ timeout: 10_000 });

      await pom.setupFlow_selectManualUpload();
      await pom.setupFlow_uploadSbomFile(sbomFile);

      await expect(page).toHaveURL(/dependency-risks/, { timeout: 30_000 });
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });
});
