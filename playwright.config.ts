import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export const STORAGE_STATE = path.join(__dirname, "playwright/.auth/user.json");

export default defineConfig({
  testDir: "./e2e/src",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  workers: 1, // only one worker because otherwise tests interfere with each other (e.g. login/logout)
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [["list"], ["html"]] : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    video: "retain-on-failure",
    /* Without this an action defaults to no timeout of its own, so a single
       click on a selector that no longer exists eats the whole test budget
       (5 minutes, and again on retry). Kept generous, because a click may
       legitimately retry for a while: toasts render top-center for 6s each and
       intercept pointer events over the nav. Explicit per-call timeouts still
       win, e.g. the long wait for the SBOM scan to produce rows. */
    actionTimeout: 60_000,
  },
  timeout: 5 * 60 * 1000, // 5 minutes per test

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: /devguard-auth-setup\.ts/,
    },
    {
      name: "chromium-authenticated",
      testMatch: /devguard-.*\.auth\.e2e\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE,
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium",
      testMatch: /devguard-(?!auth-setup).*(?<!\.auth)\.e2e\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
