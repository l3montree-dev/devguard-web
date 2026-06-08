# DevGuard – E2E Testing

The tests are written with [Playwright](https://playwright.dev/) and use a Page Object Model (POM) pattern.  
All test files live in `src/` and are named `<suite>-<flow>.e2e.spec.ts`.

## Structure

```
e2e/
├── src/
│   ├── devguard-*.e2e.spec.ts      # DevGuard test suites (run these)
│   ├── opencode-*.e2e.spec.ts      # OpenCode tests (ignored – see below)
│   ├── pom/
│   │   ├── devguard.ts             # Root POM – entry point for all DevGuard flows
│   │   └── flows/                  # Individual flow helpers (auth, org, repo, vuln, …)
│   └── utils.ts                    # Env loading, OTP helpers, shared utilities
├── assets/                         # Test fixture files (SBOM, VEX, …)
├── playwright.config.ts
└── .env                            # Local secrets (never commit this file)
```

### POM flows

Each file in `src/pom/flows/` encapsulates one functional area:

| File | Responsibility |
|------|---------------|
| `auth.ts` | Registration, login, logout |
| `org.ts` | Organisation management |
| `group.ts` | Group management |
| `repo.ts` | Repository / asset management |
| `vuln.ts` | Vulnerability and VEX rule flows |
| `artifact.ts` | Artifact uploads and scanning |
| `sharing.ts` | Sharing / permissions |
| `setup.ts` | Initial setup steps |

---

## Environment variables

Copy `.env.example` to `.env` and fill in all values **before** running any test.

```bash
cp .env.example .env
```

### Required variables

| Variable | Description |
|----------|-------------|
| `DEVGUARD_DOMAIN` | Full URL of the DevGuard instance, e.g. `https://main.devguard.org` |
| `DEVGUARD_EMAIL_LOGIN_USERNAME` | Username template for generated test accounts – must contain the literal string `XXX` which is replaced at runtime, e.g. `test-user-XXX` |
| `DEVGUARD_EMAIL_LOGIN_PASSWORD` | Password used when registering / logging in test accounts |

> The `OPEN_CODE_*` variables are only needed for the OpenCode test suite (see below) and can be left empty if you only run the DevGuard tests.

---

## Running the tests

All commands must be run from the `e2e/` directory.

```bash
# Install dependencies (first time only)
npm install

# Run all DevGuard tests sequentially (recommended – see run-devguard-tests.sh)
./e2e/run-devguard-tests.sh

# Run a single test file for debugging
npx playwright test devguard-xx.e2e.spec.ts --headed --trace on --debug
```

### OpenCode tests

The `opencode-*.e2e.spec.ts` files test the OpenCode OAuth integration and require separate credentials (`OPEN_CODE_*`).  
**These tests are excluded from `run-devguard-tests.sh`** and should not be run as part of the regular DevGuard test suite.

---

## Debugging

### VSCode

1. Open the **Testing** tab in VSCode and expand the **Playwright** section.
2. Add `await page.waitForTimeout(500_000);` where you want to pause.
3. Click **Pick locator** at the bottom of the Playwright panel → a recording bar appears in the browser.
4. Click the red recorder icon to generate selectors directly in VSCode.

---