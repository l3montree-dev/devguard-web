// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { DevGuardPOM, DevGuardNavigationLevel } from "./pom/devguard";
import { loginToDevGuardUsingOpenCode } from "./utils";

async function setupGroupAndRepo(
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

test.describe("Repository management", () => {
  test("can create a new repository within a group", async ({ page }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const repoName = `E2E Repo ${id}`;

    await setupGroupAndRepo(pom, groupName, repoName);

    try {
      await expect(
        page.getByRole("heading", { name: repoName }),
      ).toBeVisible();
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  test("can update CVSS risk settings for a repository", async ({ page }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const repoName = `E2E Repo ${id}`;

    await setupGroupAndRepo(pom, groupName, repoName);

    try {
      await page
        .locator(DevGuardNavigationLevel.Repo)
        .getByRole("link", { name: "Settings" })
        .click({ timeout: 5_000 });

      await page
        .getByRole("combobox", { name: "Confidentiality Requirement" })
        .click();
      await page.getByRole("option", { name: "High" }).click();

      await page
        .getByRole("combobox", { name: "Integrity Requirement" })
        .click();
      await page.getByRole("option", { name: "Low" }).click();

      await page
        .getByRole("combobox", { name: "Availability Requirement" })
        .click();
      await page.getByRole("option", { name: "Medium" }).click();

      await page.getByRole("button", { name: "Update" }).click();

      await expect(page.getByText("Settings updated")).toBeVisible({
        timeout: 10_000,
      });
    } finally {
      await cleanupRepoAndGroup(pom);
    }
  });

  test("can delete a repository via the settings page", async ({ page }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const repoName = `E2E Repo ${id}`;

    await setupGroupAndRepo(pom, groupName, repoName);

    try {
      await pom.deleteRepo();

      await expect(
        page.getByText("Your Repositories will show up here!"),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      // repo already deleted; clean up the group only
      try {
        await pom.deleteGroup();
      } catch (e) {
        console.warn("Group cleanup failed:", e);
      }
    }
  });
});
