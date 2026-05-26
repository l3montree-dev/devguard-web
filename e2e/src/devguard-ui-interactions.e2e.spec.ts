// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import path from "path";
import { DevGuardPOM, DevGuardNavigationLevel } from "./pom/devguard";
import { loginToDevGuardUsingOpenCode } from "./utils";

async function createGroupAndRepo(
  pom: DevGuardPOM,
  groupName: string,
  repoName: string,
) {
  await loginToDevGuardUsingOpenCode(pom.page);
  await pom.createGroup(groupName, "Temporary E2E test group");
  await pom.createRepo(repoName, "Temporary E2E test repository");
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

test.describe("UI interactions — buttons, dialogs and navigation", () => {
  // ── Theme switcher ────────────────────────────────────────────────────────

  test("can cycle through Light / Dark / System themes at org level", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    await loginToDevGuardUsingOpenCode(page);

    await pom.testLightDarkSystemMode(DevGuardNavigationLevel.Organization);
  });

  // ── New repository onboarding buttons ────────────────────────────────────

  test("can open the Setup Risk Scanning dialog on a new repository", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();

    await createGroupAndRepo(pom, `E2E Group ${id}`, `E2E Repo ${id}`);

    try {
      await page
        .getByRole("button", { name: "Setup Risk Scanning" })
        .click({ timeout: 10_000 });

      // scanner selection step should be visible
      await expect(
        page.getByText("Select a Scanner"),
      ).toBeVisible({ timeout: 5_000 });

      // close the dialog with the X button
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Setup Risk Scanning" }),
      ).toBeVisible({ timeout: 5_000 });
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  test("can open the Setup Ticket-Integration dialog on a new repository", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();

    await createGroupAndRepo(pom, `E2E Group ${id}`, `E2E Repo ${id}`);

    try {
      await page
        .getByRole("button", { name: "Setup Ticket-Integration" })
        .click({ timeout: 10_000 });

      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });

      await page.keyboard.press("Escape");
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  // ── Repository settings — Connect to a repository ────────────────────────

  test("can see the Connect to a repository section in repo settings", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();

    await createGroupAndRepo(pom, `E2E Group ${id}`, `E2E Repo ${id}`);

    try {
      await page
        .locator(DevGuardNavigationLevel.Repo)
        .getByRole("link", { name: "Settings" })
        .click({ timeout: 5_000 });

      await expect(
        page.getByText("Connect to a repository"),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  // ── Repo-level nav links after SBOM upload ───────────────────────────────

  test("can navigate all repo-level sidebar links after an SBOM is uploaded", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const sbomFile = path.join(__dirname, "../assets/sbom.json");

    await loginToDevGuardUsingOpenCode(page);
    await pom.createGroup(`E2E Group ${id}`, "Temporary E2E test group");
    await pom.createRepo(`E2E Repo ${id}`, "Temporary E2E test repository");
    await pom.setupFlow_setupRiskScanning();
    await pom.setupFlow_selectManualUpload();
    await pom.setupFlow_uploadSbomFile(sbomFile);

    // wait for navigation to dependency-risks after upload
    await expect(page).toHaveURL(/dependency-risks/, { timeout: 30_000 });

    try {
      await page.getByRole("link", { name: "Overview" }).click();
      await expect(page).toHaveURL(/\/refs\/[^/]+$/, { timeout: 5_000 });

      await page.getByRole("link", { name: "Dependency Risks" }).click();
      await expect(page).toHaveURL(/dependency-risks/);

      await page.getByRole("link", { name: "Dependencies" }).click();
      await expect(page).toHaveURL(/\/dependencies$/);

      await page.getByRole("link", { name: "License Risks" }).click();
      await expect(page).toHaveURL(/license-risks/);

      await page.getByRole("link", { name: "Artifacts" }).click();
      await expect(page).toHaveURL(/\/artifacts$/);

      await page.getByRole("link", { name: "Compliance" }).click();
      await expect(page).toHaveURL(/\/compliance$/);
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  // ── Repo overview — Download PDF-Report ──────────────────────────────────

  test("shows the Download PDF-Report button as disabled when no artifact is selected", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const sbomFile = path.join(__dirname, "../assets/sbom.json");

    await loginToDevGuardUsingOpenCode(page);
    await pom.createGroup(`E2E Group ${id}`, "Temporary E2E test group");
    await pom.createRepo(`E2E Repo ${id}`, "Temporary E2E test repository");
    await pom.setupFlow_setupRiskScanning();
    await pom.setupFlow_selectManualUpload();
    await pom.setupFlow_uploadSbomFile(sbomFile);

    await expect(page).toHaveURL(/dependency-risks/, { timeout: 30_000 });

    try {
      await page.getByRole("link", { name: "Overview" }).click();
      await expect(page).toHaveURL(/\/refs\/[^/]+$/, { timeout: 5_000 });

      // without an artifact selected the button should be disabled
      const downloadBtn = page.getByRole("button", {
        name: "Download PDF-Report",
      });
      await expect(downloadBtn).toBeVisible({ timeout: 10_000 });
      await expect(downloadBtn).toBeDisabled();
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  // ── Dependencies page — Open Dependency Graph ────────────────────────────

  test("can open the Dependency Graph from the Dependencies page", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const sbomFile = path.join(__dirname, "../assets/sbom.json");

    await loginToDevGuardUsingOpenCode(page);
    await pom.createGroup(`E2E Group ${id}`, "Temporary E2E test group");
    await pom.createRepo(`E2E Repo ${id}`, "Temporary E2E test repository");
    await pom.setupFlow_setupRiskScanning();
    await pom.setupFlow_selectManualUpload();
    await pom.setupFlow_uploadSbomFile(sbomFile);

    await expect(page).toHaveURL(/dependency-risks/, { timeout: 30_000 });

    try {
      await page.getByRole("link", { name: "Dependencies" }).click();
      await expect(page).toHaveURL(/\/dependencies$/, { timeout: 5_000 });

      await page
        .getByRole("link", { name: "Open Dependency Graph" })
        .click({ timeout: 5_000 });

      await expect(page).toHaveURL(/\/graph/, { timeout: 10_000 });
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });
});
