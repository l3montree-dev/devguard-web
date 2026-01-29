# DevGuard - E2E Testing

## Tips

npx playwright codegen https://main.devguard.org/login

## Run Tests

```bash
# run all e2e tests
npx playwright test --headed --trace on

# run single e2e test file (e.g. devguard-login-flow.e2e.spec.ts)
npx playwright test --headed --trace on devguard-login-flow

npx playwright test --headed --trace on --debug # note that you need to press the "Play" button sometimes to actually start the test

npx playwright test --headed --trace on --debug devguard-login-flow.e2e.spec.ts:67 # run single test (the test defined at line 77 of file devguard-login-flow)
```

## Debugging

### via VSCode

If you need to adjust/debug a tests - open the Testing Tab in VSCode and go to the Playwright section and launch test

- add `await page.waitForTimeout(500_000);` where you need to stop the test
  - make sure to add an extra empty line below and set the cursor there
- go to vscode -> testing -> on the bottom is a "Playwright" section -> click on "Pick locator"
  - -> At the top of the browser will appear a bar with a recording sign.
  - Click on the red recorder icon and it should generate code right in VSCode

### via Commandline / Playwright Debug UI

- Add `await page.waitForTimeout(500_000);` where you need to stop the test
- Launch Test `npx playwright test --headed --trace on --debug devguard-login-flow` (run single e2e test e.g. devguard-login-flow.e2e.spec.ts)
  - You might need to click "Play" button to start the test
- Wait until tests stops at page.waitForTimeout - use "Record" Button at the top of the page to record changes (copy code into test after you are done)

## Making UI Changes

- Run the devguard-web project (`npm run dev`)
- Either launch Backend locally as well or forward Ports (Kratos and API)
  - `docker compose up` in backend project
  - VSCode "Run and Debug" -> Launch Server
