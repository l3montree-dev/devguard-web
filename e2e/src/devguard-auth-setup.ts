import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { DevGuardPOM } from "./pom/devguard";
import { STORAGE_STATE } from '../playwright.config';

const authFile = STORAGE_STATE;

setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  const devguardPOM = new DevGuardPOM(page);
  await devguardPOM.loadAndRegister();
  // wait until the org creation UI is visible — proves the session is fully established
  await page.getByTestId('org-name-label').waitFor({ state: 'visible', timeout: 30_000 });
  await page.context().storageState({ path: authFile });
});
