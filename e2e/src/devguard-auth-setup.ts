// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";
import { DevGuardPOM } from "./pom/devguard";
import { storageStateFor } from "../../playwright.config";

setup("authenticate", async ({ page, browserName }) => {
  const authFile = storageStateFor(browserName);
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  const devguardPOM = new DevGuardPOM(page);
  await devguardPOM.loadAndRegister();
  // wait until the org creation UI is visible — proves the session is fully established
  await page
    .getByTestId("org-name-label")
    .waitFor({ state: "visible", timeout: 30_000 });
  await page.context().storageState({ path: authFile });
});
