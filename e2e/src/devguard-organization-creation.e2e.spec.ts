// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

// NOTE: Organizations created here cannot be deleted via UI.
// Deletion requires a support request via "Request Organization Deletion" in org settings.
// Test orgs will accumulate on the account and must be cleaned up manually.

import { expect, test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { envConfig, loginToDevGuardUsingOpenCode } from "./utils";

test.describe("Organization creation", () => {
  test("can reach the organization creation form at /setup", async ({
    page,
  }) => {
    await loginToDevGuardUsingOpenCode(page);

    await page.goto(`${envConfig.devGuard.domain}/setup`);

    await expect(
      page.getByRole("textbox", { name: "Organization name*" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Organization" }),
    ).toBeVisible();
  });

  test("shows a validation error when submitting an empty organization name", async ({
    page,
  }) => {
    await loginToDevGuardUsingOpenCode(page);
    await page.goto(`${envConfig.devGuard.domain}/setup`);

    await page.getByRole("button", { name: "Create Organization" }).click();

    // form should not navigate away — the name field is still visible
    await expect(
      page.getByRole("textbox", { name: "Organization name*" }),
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/setup`));
  });

  // Creates a real org on main.devguard.org — requires manual cleanup via "Request Organization Deletion"
  test("can create a new organization and land on its dashboard", async ({
    page,
  }) => {
    const pom = new DevGuardPOM(page);
    const orgName = `E2E Org ${Date.now()}`;

    await loginToDevGuardUsingOpenCode(page);
    await page.goto(`${envConfig.devGuard.domain}/setup`);
    await pom.createOrganization(orgName);

    // after creation the app redirects to the new org's page
    await expect(page.getByText(orgName)).toBeVisible({ timeout: 15_000 });
    await expect(page).not.toHaveURL(new RegExp(`/setup`));
  });

  test("can navigate to the Groups page of the active organization", async ({
    page,
  }) => {
    await loginToDevGuardUsingOpenCode(page);
    // after login we are on /{orgSlug} — the org home page shows a Groups nav link
    await page.getByRole("link", { name: "Groups" }).click({ timeout: 5_000 });

    await expect(page).toHaveURL(/groups/);
    await expect(
      page.getByRole("button", { name: "New Group" }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
