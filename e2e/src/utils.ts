import * as OTPAuth from "otpauth";
import { DevGuardPOM } from "./pom/devguard";
import { Page } from "@playwright/test";
import { OpenCodePOM } from "./pom/opencode";

export async function generateOTP(secret: string) {
  const totp = new OTPAuth.TOTP({
    secret: secret,
    digits: 6,
    algorithm: "sha1",
    period: 30,
  });

  const remaining = totp.remaining();
  if(remaining < 10000) { // if less than 5 seconds remain, wait for the next period
    console.log("Waiting for next OTP period...");
    await sleep(remaining + 2000);
  }
  console.log(`Time remaining for current OTP: ${remaining} milliseconds`);

  return totp.generate();
}

function sleep(timeInMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}


// TODO: Remove this workaround once https://github.com/l3montree-dev/devguard/issues/1193 is fixed
export async function TEMPORARY_WORKAROUND(page: Page, devguardPOM: DevGuardPOM) {
  // race-condition sometimes where token is not updated properly.. therefore update first
  // remove this block once Tim has fixed this race condition
  await page.waitForTimeout(5_000);
  if (await page.getByRole('link', { name: 'Reauthorize' }).isVisible()) {
    await page.getByRole('link', { name: 'Reauthorize' }).click();
    await page.waitForTimeout(5_000); // wait for token to be updated
    await devguardPOM.verifyOnDevGuardURL();
  }
}

export async function loginToDevGuardUsingOpenCode(page: Page) {
  const devguardPOM = new DevGuardPOM(page);
  const openCodePOM = new OpenCodePOM(page);

  // start login flow in devguard
  await devguardPOM.loginWithOpenCode(); // click on login with openCode button
  await openCodePOM.login(false); // complete login via openCode without redirect
  await openCodePOM.grantAccess();
  
  // expect to be back on devguard
  await devguardPOM.verifyOnDevGuardURL();
};