// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { loginToDevGuardUsingOpenCode } from "./utils";

test.describe("Group management", () => {
  test("can create a new group within an organization", async ({ page }) => {
    const pom = new DevGuardPOM(page);
    const groupName = `E2E Group ${Date.now()}`;

    await loginToDevGuardUsingOpenCode(page);
    await pom.createGroup(groupName, "Temporary E2E test group");

    try {
      await expect(
        page.getByRole("heading", { name: groupName }),
      ).toBeVisible();
    } finally {
      try {
        await pom.deleteGroup();
      } catch (e) {
        console.warn("Group cleanup failed:", e);
      }
    }
  });

  test("can navigate all group-level header links", async ({ page }) => {
    const pom = new DevGuardPOM(page);
    const groupName = `E2E Group ${Date.now()}`;

    await loginToDevGuardUsingOpenCode(page);
    await pom.createGroup(groupName, "Temporary E2E test group");

    try {
      await page.getByRole("link", { name: "Overview" }).click();
      await expect(page).toHaveURL(/overview/);

      await page.getByRole("link", { name: "Releases" }).click();
      await expect(page).toHaveURL(/releases/);

      await page.getByRole("link", { name: "Subgroups & Repositories" }).click();
      await expect(page).toHaveURL(/projects/);

      await page
        .getByRole("link", { name: "Compliance" })
        .nth(1)
        .click({ timeout: 5_000 });
      await expect(page).toHaveURL(/compliance/);
    } finally {
      try {
        await pom.deleteGroup();
      } catch (e) {
        console.warn("Group cleanup failed:", e);
      }
    }
  });

  test("can create a subgroup within a group", async ({ page }) => {
    const pom = new DevGuardPOM(page);
    const id = Date.now();
    const groupName = `E2E Group ${id}`;
    const subgroupName = `E2E Subgroup ${id}`;

    await loginToDevGuardUsingOpenCode(page);
    await pom.createGroup(groupName, "Temporary E2E test group");

    try {
      await page.getByRole("link", { name: "Subgroups & Repositories" }).click();
      await page.getByRole("button", { name: "Create subgroup" }).click();
      await page.getByRole("textbox", { name: "Name" }).fill(subgroupName);
      await page
        .getByRole("textbox", { name: "Description" })
        .fill("Temporary E2E subgroup");
      await page.getByRole("button", { name: "Create" }).click();

      await expect(
        page.getByRole("heading", { name: subgroupName }),
      ).toBeVisible();

      // delete subgroup first so the parent group can be deleted
      await pom.deleteGroup();
    } finally {
      // delete parent group (navigated back to it after subgroup deletion)
      try {
        await pom.deleteGroup();
      } catch (e) {
        console.warn("Group cleanup failed:", e);
      }
    }
  });
});
