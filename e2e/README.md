# DevGuard - E2E Testing

## Tips

## Herausforderungen: 
npx playwright codegen https://main.devguard.org/login


If you need to adjust tests:
- add `await page.waitForTimeout(60_000);` where you need to stop the test
- go to vscode -> testing -> on the bottom is a "Playwright" section -> click on "Pick locator" -> At the top of the browser will appear a bar with a recording sign. Click on the red recorder icon and it should generate code right in VSCode