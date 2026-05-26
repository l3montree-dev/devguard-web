# Playwright E2E Testing Handbook — DevGuard

## Table of Contents

1. [Setup & Running Tests](#1-setup--running-tests)
2. [Project Structure](#2-project-structure)
3. [Core Strategy: Keep Tests Small](#3-core-strategy-keep-tests-small)
4. [Page Object Model (POM)](#4-page-object-model-pom)
5. [Writing a New Test](#5-writing-a-new-test)
6. [Selectors — What to Use and What to Avoid](#6-selectors--what-to-use-and-what-to-avoid)
7. [Assertions](#7-assertions)
8. [Test Isolation & State Management](#8-test-isolation--state-management)
9. [Handling Async & Timing](#9-handling-async--timing)
10. [CI vs. Local Differences](#10-ci-vs-local-differences)
11. [Debugging Failing Tests](#11-debugging-failing-tests)
12. [Common Pitfalls in This Codebase](#12-common-pitfalls-in-this-codebase)

---

## 1. Setup & Running Tests

### Prerequisites

```bash
cd e2e
npm install
npx playwright install chromium   # only needed once
```

### Environment variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required variables (see `src/utils.ts` for the full list):

| Variable | Description |
|---|---|
| `DEVGUARD_DOMAIN` | e.g. `https://main.devguard.org` |
| `DEVGUARD_EMAIL_LOGIN_USERNAME` | Use `XXX` as a placeholder — replaced with a timestamp at runtime |
| `DEVGUARD_EMAIL_LOGIN_PASSWORD` | Password for email-based tests |
| `OPEN_CODE_USERNAME` | OpenCode login username |
| `OPEN_CODE_PASSWORD` | OpenCode login password |
| `OPEN_CODE_TOTP_SECRET` | Base32 TOTP secret for 2FA |

### Run commands

```bash
# Run all tests (headless, default)
npx playwright test

# Run headed so you can watch the browser
npx playwright test --headed

# Run a single file
npx playwright test --headed devguard-repo-flow.e2e.spec.ts

# Run one specific test by name
npx playwright test --headed -g "should create a repository"

# Debug a test step-by-step (opens Playwright Inspector)
npx playwright test --headed --debug devguard-repo-flow.e2e.spec.ts

# Stop at a specific line
npx playwright test --headed --debug devguard-repo-flow.e2e.spec.ts:42

# Show the HTML report after a run
npx playwright show-report
```

### Trace viewer (built-in time-travel debugger)

Traces are recorded for every run (configured in `playwright.config.ts`).  
After a failure open the trace in the HTML report, or directly:

```bash
npx playwright show-trace test-results/<run>/trace.zip
```

---

## 2. Project Structure

```
e2e/
├── src/
│   ├── pom/
│   │   ├── devguard.ts          # DevGuard page-object methods
│   │   └── opencode.ts          # OpenCode page-object methods
│   ├── utils.ts                 # envConfig, OTP helper, LoggingAnalyzer
│   ├── *.e2e.spec.ts            # Test files (one concern per file)
├── assets/
│   ├── sbom.json                # SBOM file used in upload tests
│   └── devguard-web.json        # Large release upload fixture
├── playwright.config.ts
├── .env.example
└── HANDBOOK.md                  ← you are here
```

**Rule of thumb:** test files contain *what* is verified; POM files contain *how* to interact with the UI. Keep them separate.

---

## 3. Core Strategy: Keep Tests Small

The biggest maintainability problem in the current suite is that each test does too much. A test that creates an org, a group, a repo, uploads an SBOM, checks settings, and deletes the repo is six tests welded together.

### The problem with large tests

- A failure 80% through wastes 80% of the run time before you know what broke.
- The failure message points at the wrong step.
- Debugging requires mentally unwinding the entire sequence.
- Impossible to run just the part you care about.

### Split by concern

Each `test()` block should verify **one user-facing behaviour**:

```
// BAD — one test does everything
test('full repo lifecycle', async ({ page }) => {
  await pom.createOrganization(...)
  await pom.createGroup(...)
  await pom.createRepo(...)
  await pom.uploadSbom(...)
  await pom.checkSettings(...)
  await pom.deleteRepo(...)
})

// GOOD — shared setup, focused assertions
test.beforeEach(async ({ page }) => {
  await pom.loginWithOpenCode()
  await pom.createOrganization('Test Org')
  await pom.createGroup('Test Group', '...')
})

test('can create a repository', async ({ page }) => {
  await pom.createRepo('My Repo', '...')
  await expect(page.getByRole('heading', { name: 'My Repo' })).toBeVisible()
})

test('can upload an SBOM to a repository', async ({ page }) => {
  await pom.createRepo('My Repo', '...')
  await pom.setupFlow_setupRiskScanning()
  await pom.setupFlow_selectManualUpload()
  await pom.setupFlow_uploadSbomFile('assets/sbom.json')
  await expect(page.getByText('Upload successful')).toBeVisible()
})
```

### Ideal test size

| Measure | Target |
|---|---|
| Lines per `test()` block | ≤ 20 |
| Assertions per test | 1–3 |
| Shared setup | `beforeEach` or a fixture |
| Total test file length | ≤ 150 lines |

---

## 4. Page Object Model (POM)

A POM wraps UI interactions so tests stay readable. Methods in a POM should be **actions** or **assertions**, never both in the same method.

### The existing POMs

- [src/pom/devguard.ts](src/pom/devguard.ts) — all DevGuard interactions
- [src/pom/opencode.ts](src/pom/opencode.ts) — OpenCode OAuth flows

### When to add a new POM method

Add a method to the POM when the same sequence of clicks appears in two or more tests. If it only appears once, keep it inline in the test — it is easier to read.

### POM method guidelines

```typescript
// Good — single action, no assertion inside
async openRepoSettings() {
  await this.page
    .locator(DevGuardNavigationLevel.Repo)
    .getByRole('link', { name: 'Settings' })
    .click({ timeout: 5_000 })
}

// Good — dedicated assertion method
async verifyRepoVisible(name: string) {
  await expect(
    this.page.getByRole('heading', { name })
  ).toBeVisible({ timeout: 10_000 })
}

// Bad — action + assertion mixed, hard to reuse
async clickSettingsAndVerifyLoaded() {
  await this.page.getByRole('link', { name: 'Settings' }).click()
  await expect(this.page.getByText('Confidentiality')).toBeVisible()
}
```

### Split large POMs by domain

When `devguard.ts` grows beyond ~300 lines, split by domain:

```
pom/
├── devguard.ts          # base: navigation, login, logout
├── repo.ts              # repo creation, settings, deletion
├── scanning.ts          # SBOM upload, scanner setup flows
└── artifacts.ts         # artifact CRUD
```

Each specialised POM can `extend` the base or receive the `page` directly.

---

## 5. Writing a New Test

### Step 1 — Create the file

Name pattern: `<feature-area>.e2e.spec.ts`

```bash
touch e2e/src/devguard-artifact-flow.e2e.spec.ts
```

### Step 2 — Scaffold

```typescript
import { test, expect } from '@playwright/test'
import { DevGuardPOM } from './pom/devguard'
import { loginToDevGuardUsingOpenCode } from './utils'

test.describe('Artifact management', () => {
  let pom: DevGuardPOM

  test.beforeEach(async ({ page }) => {
    pom = new DevGuardPOM(page)
    await loginToDevGuardUsingOpenCode(page)
    // navigate to the starting point every test needs
    await pom.createTestOrganizationGroupAndRepo()
  })

  test('can create an artifact', async ({ page }) => {
    await pom.createNewArtifact('my-image', 'https://hub.docker.com/r/example/my-image')
    await expect(page.getByText('my-image')).toBeVisible()
  })

  test('can delete an artifact', async ({ page }) => {
    await pom.createNewArtifact('temp-artifact', 'https://example.com')
    await pom.deleteFirstArtifact()
    await expect(page.getByText('temp-artifact')).not.toBeVisible()
  })
})
```

### Step 3 — Run it in watch mode while developing

```bash
npx playwright test --headed --debug devguard-artifact-flow.e2e.spec.ts
```

### Step 4 — Use codegen to record clicks if unsure of the selectors

```bash
npx playwright codegen https://main.devguard.org/
```

Codegen opens a browser and records every click/fill into test code. Copy the selectors you need, then clean them up using the selector hierarchy below.

---

## 6. Selectors — What to Use and What to Avoid

Prefer selectors that reflect *what the user sees*, not implementation details.

### Preference order

| Priority | Method | Example |
|---|---|---|
| 1 (best) | `getByRole` | `page.getByRole('button', { name: 'Create' })` |
| 2 | `getByLabel` | `page.getByLabel('Repository name')` |
| 3 | `getByText` | `page.getByText('Successfully created')` |
| 4 | `getByPlaceholder` | `page.getByPlaceholder('Enter a name...')` |
| 5 | `getByTestId` | `page.getByTestId('create-repo-btn')` — requires `data-testid` in the app |
| 6 (avoid) | CSS class | `page.locator('.repo-settings')` — brittle, breaks on refactor |
| 7 (avoid) | nth index | `page.getByRole('link').nth(3)` — breaks when order changes |

### When `nth` is unavoidable

If nth-index selectors are necessary, add a comment explaining why and add a `data-testid` to the app component as a follow-up:

```typescript
// TODO: add data-testid="settings-link-repo" to the component
await this.page.getByRole('link', { name: 'Settings' }).nth(3).click()
```

### Scoping with `locator`

Use a parent locator to scope child queries instead of relying on index:

```typescript
// Instead of:
await page.getByRole('button', { name: 'Delete' }).nth(0).click()

// Scope to the first card:
const firstCard = page.locator('.artifact-card').first()
await firstCard.getByRole('button', { name: 'Delete' }).click()
```

---

## 7. Assertions

Always use Playwright's built-in `expect` — it auto-retries until the condition is true or the timeout expires.

```typescript
// Visibility
await expect(page.getByText('Repository created')).toBeVisible()
await expect(page.getByRole('dialog')).not.toBeVisible()

// URL
await expect(page).toHaveURL(/\/repos\/my-repo/)

// Form state
await expect(page.getByRole('checkbox')).toBeChecked()
await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Test Repo')

// Count
await expect(page.getByRole('row')).toHaveCount(3)
```

### Custom timeouts

Use explicit timeouts only when the default (30 s) is clearly wrong:

```typescript
// Longer for operations that trigger background jobs
await expect(page.getByText('Scan complete')).toBeVisible({ timeout: 60_000 })

// Shorter for elements that should already be there
await expect(page.getByRole('heading')).toBeVisible({ timeout: 3_000 })
```

---

## 8. Test Isolation & State Management

### The golden rule

Every test must be able to run in isolation and leave the system in the same state it found it.

### Login state

The current suite logs in via `beforeEach`. For speed, Playwright supports saving auth state to a file and reusing it:

```typescript
// global-setup.ts
import { chromium } from '@playwright/test'
import { loginToDevGuardUsingOpenCode } from './src/utils'

export default async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await loginToDevGuardUsingOpenCode(page)
  await page.context().storageState({ path: 'e2e/.auth/state.json' })
  await browser.close()
}
```

```typescript
// playwright.config.ts
use: {
  storageState: 'e2e/.auth/state.json',
},
globalSetup: './src/global-setup.ts',
```

This logs in once for the entire run instead of once per test.

### Data cleanup

Tests that create data (orgs, repos, artifacts) must delete it in `afterEach` or `afterAll`:

```typescript
test.afterEach(async ({ page }) => {
  const pom = new DevGuardPOM(page)
  // delete everything created during the test
  await pom.deleteRepo()
})
```

If cleanup itself might fail, wrap it:

```typescript
test.afterEach(async ({ page }) => {
  try {
    await new DevGuardPOM(page).deleteRepo()
  } catch {
    // cleanup failed — log but don't mask the original test failure
    console.warn('afterEach cleanup failed')
  }
})
```

### Why only 1 worker

`playwright.config.ts` sets `workers: 1` because tests share a single user account. If you introduce per-test unique usernames/organisations, you can safely increase the worker count for faster parallel runs.

---

## 9. Handling Async & Timing

### Avoid `waitForTimeout`

`page.waitForTimeout(500)` is a sleep — it makes tests slow and flaky (too short on a slow machine, wasteful on a fast one).

Replace with condition-based waits:

```typescript
// Instead of:
await page.waitForTimeout(500)
await page.getByRole('button', { name: 'Continue' }).click()

// Wait for the button to be enabled:
await page.getByRole('button', { name: 'Continue' }).waitFor({ state: 'visible' })
await page.getByRole('button', { name: 'Continue' }).click()

// Or wait for a network response that triggers the UI change:
await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/scan')),
  page.getByRole('button', { name: 'Start scan' }).click(),
])
```

### `waitForLoadState`

Use `networkidle` sparingly — it waits until no network requests for 500 ms, which is fragile on apps with polling:

```typescript
// Use 'domcontentloaded' or 'load' when possible
await page.waitForLoadState('load')

// Only use 'networkidle' for initial page loads after navigation
await page.goto(url)
await page.waitForLoadState('networkidle')
```

### OTP timing (already handled in `utils.ts`)

The `generateOTP()` utility waits if fewer than 5 seconds remain on the current TOTP period. Do not duplicate this logic.

---

## 10. CI vs. Local Differences

| Aspect | Local | CI |
|---|---|---|
| Retries | 0 | 1 (configured in `playwright.config.ts`) |
| Email verification | Skipped (localhost) | Required (non-localhost) |
| Headed | Yes (for debugging) | No |
| Trace | Always on | Always on |

The `DEVGUARD_DOMAIN` env var controls which environment tests target. On CI, set it to the staging URL.

CI command:

```bash
npx playwright test --reporter=html
```

---

## 11. Debugging Failing Tests

### Step 1 — Open the HTML report

```bash
npx playwright show-report
```

Click the failing test → open the trace → step through each action with screenshots and network calls.

### Step 2 — Replay with debug inspector

```bash
npx playwright test --headed --debug devguard-repo-flow.e2e.spec.ts
```

Use the Playwright Inspector toolbar to step forward/backward. The `locator.highlight()` call shows you exactly what element Playwright is targeting.

### Step 3 — Use `page.pause()`

Insert `await page.pause()` at the point of failure to freeze the browser and inspect the DOM:

```typescript
await pom.createRepo('Test', 'desc')
await page.pause()   // ← browser freezes here, open DevTools
await pom.deleteRepo()
```

### Step 4 — Check the `LoggingAnalyzer`

The `LoggingAnalyzer` in `utils.ts` captures console errors. Uncomment the assertion in `devguard.ts` constructor to fail tests on browser console errors:

```typescript
page.on('close', () => {
  expect(loggingAnalyzer.logs).toEqual([])  // uncomment when investigating console noise
})
```

---

## 12. Common Pitfalls in This Codebase

| Pitfall | What happens | Fix |
|---|---|---|
| `nth(3)` selector | Breaks when nav order changes | Add `data-testid` to the component |
| Missing `await` on `expect` | Test passes even when assertion fails | Always `await expect(...)` |
| Large test methods in POM | Hides which step actually failed | One action per POM method |
| No `afterEach` cleanup | Tests pollute each other's state | Always clean up created data |
| `waitForTimeout(500)` | Flaky on slow machines | Replace with condition-based waits |
| Checking element count via index | Fails when UI adds a new element | Scope with a parent locator instead |
| Sharing one login for all tests | Forces `workers: 1` | Use unique credentials per test or storage state |
