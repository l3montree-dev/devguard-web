// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { docShot } from "./doc-shot";

test.use({ viewport: { width: 1440, height: 900 } });

const SATitle = "Unauthenticated identity assertion via `X-Admin-Token` header"
const SADescription = `Impact
The SessionMiddleware accepts a client-supplied X-Admin-Token HTTP request header and uses its raw string value as the authenticated userID when no Kratos session cookie is present. An unauthenticated attacker who knows or can guess a target user's Kratos identity UUID can issue requests as that user. Where the target user is an organisation admin or owner, this gives the attacker full control over that organisation's DevGuard resources.

Patches
The release v1.2.2 patches this issue. Update your DevGuard API Instances to this version.

Workarounds
Configure a reverse proxy to strip the X-Admin-Token header before sending requests to the DevGuard API.

References
Fixed commit: 6f38310`
const SAVector = "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
const SAEcosystem = "oci"
const SAPackage = "devguard"
const SASemverStart = "1.2.2"
const SASemverEnd = "1.2.2"

test.describe("DevGuard create security Advisory flows", () => {
  let devguardPOM: DevGuardPOM;

  test.beforeEach(async ({ page }) => {
    devguardPOM = new DevGuardPOM(page);
    await devguardPOM.loadDevGuard();
    await devguardPOM.createTestOrganizationGroupAndRepo();
  });

  test("test create security advisory", async ({ page }, testInfo) => {
  await devguardPOM.setupSbomUpload();
  await page.getByTestId("nav-asset-code-risks-chevron").click();
  await page.getByTestId("nav-asset-advisory").click();
  await page.setViewportSize({ width: 1440, height: 1800 });
  await page.getByTestId("create-security-advisory").click();
  await page.waitForTimeout(5_000);
  await docShot(page, testInfo, "security-advisory-creation");
  await devguardPOM.advisory().createNewAdvisory(SATitle, SADescription, SAVector, SAEcosystem, SAPackage, SASemverStart, SASemverEnd);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(5_000);
  await docShot(page, testInfo, "security-advisory-overview");
  await page.getByRole('cell', { name: 'Unauthenticated identity' }).click();
  await page.waitForTimeout(5_000);
  await docShot(page, testInfo, "security-advisory-detailed");
  });
});