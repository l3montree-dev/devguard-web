import * as OTPAuth from "otpauth";
import { DevGuardPOM } from "./pom/devguard";
import type { Page } from "@playwright/test";
import { OpenCodePOM } from "./pom/opencode";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: [
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, "../../.env"),
  ],
  quiet: true,
});

export async function generateOTP(secret: string) {
  const totp = new OTPAuth.TOTP({
    secret: secret,
    digits: 6,
    algorithm: "sha1",
    period: 30,
  });

  const remaining = totp.remaining();
  if (remaining < 5000) {
    // if less than X seconds remain, wait for the next period
    console.log("Waiting for next OTP period...");
    await sleep(remaining + 1000);
  }
  console.log(`Time remaining for current OTP: ${remaining} milliseconds`);

  return totp.generate();
}

function sleep(timeInMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

// TODO: Remove this workaround once https://github.com/l3montree-dev/devguard/issues/1193 is fixed
export async function TEMPORARY_WORKAROUND(
  page: Page,
  devguardPOM: DevGuardPOM,
) {
  // race-condition sometimes where token is not updated properly.. therefore update first
  // remove this block once Tim has fixed this race condition
  if (await page.getByRole("link", { name: "Reauthorize" }).isVisible()) {
    await page.getByRole("link", { name: "Reauthorize" }).click();
    await devguardPOM.verifyOnDevGuardURL();
  }
}

export async function loginToDevGuardUsingOpenCode(page: Page) {
  const devguardPOM = new DevGuardPOM(page);
  const openCodePOM = new OpenCodePOM(page);

  // start login flow in devguard
  await devguardPOM.auth().loginWithOpenCode(); // click on login with openCode button
  await openCodePOM.login(false); // complete login via openCode without redirect
  await openCodePOM.grantAccess();

  // expect to be back on devguard
  await devguardPOM.verifyOnDevGuardURL();
}

function loadEnvVariables() {
  const config = {
    openCode: {
      username: process.env.OPEN_CODE_USERNAME!,
      password: process.env.OPEN_CODE_PASSWORD!,
      totpSecret: process.env.OPEN_CODE_TOTP_SECRET!,
    },
    devGuard: {
      usernameTemplate: process.env.DEVGUARD_EMAIL_LOGIN_USERNAME!,
      password: process.env.DEVGUARD_EMAIL_LOGIN_PASSWORD!,
      domain: process.env.DEVGUARD_DOMAIN!,
      uniqueUsername: () =>
        config.devGuard.usernameTemplate.replace(
          "XXX",
          `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ),
      uniqueEMail: () =>
        config.devGuard.usernameTemplate
          .replace(
            "XXX",
            `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          )
          .concat("@example.com"),
    },
  };

  for (const [key, value] of Object.entries(config)) {
    for (const [subKey, subValue] of Object.entries(value)) {
      if (subValue === undefined) {
        throw new Error(`Missing config value: ${key}.${subKey}`);
      }
    }
  }

  return config;
}

const IGNORED_BROWSER_MESSAGES: RegExp[] = [
  /Download the React DevTools/,
  /^\[HMR\]/,
  /^\[Fast Refresh\]/,
  /THREE\.Clock: This module has been deprecated/,
  /using deprecated parameters for the initialization function/,
  /The Ory SDK is missing a required function/,
  /The relying party ID is not a registrable domain suffix/,
  /GL Driver Message/,
];

const analyzers = new WeakMap<Page, LoggingAnalyzer>();

export class LoggingAnalyzer {
  public readonly logs: string[] = [];

  private readonly alreadyPrinted = new Set<string>();

  static attach(page: Page): LoggingAnalyzer {
    let analyzer = analyzers.get(page);
    if (!analyzer) {
      analyzer = new LoggingAnalyzer(page);
      analyzers.set(page, analyzer);
    }
    return analyzer;
  }

  private constructor(page: Page) {
    const verbose = !!process.env.E2E_VERBOSE_CONSOLE;

    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      const url = msg.location().url;
      const detail = url && !text.includes(url) ? `${text} (${url})` : text;
      const ignored = IGNORED_BROWSER_MESSAGES.some((re) => re.test(detail));

      if (type === "error" && !ignored) {
        this.logs.push(detail);
      }

      if (verbose) {
        console.log(`[browser:${type}] ${detail}`);
      } else if (!ignored && (type === "error" || type === "warning")) {
        this.print(type, detail);
      }
    });
    page.on("pageerror", (error) => {
      this.logs.push(error.message);
      this.print("pageerror", error.message);
    });
  }
  private print(type: string, text: string) {
    const key = `${type}:${text}`;
    if (this.alreadyPrinted.has(key)) {
      return;
    }
    this.alreadyPrinted.add(key);
    console.log(`[browser:${type}] ${text}`);
  }
}

export const envConfig = loadEnvVariables();
