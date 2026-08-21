import type { Locator, Page, TestInfo } from "@playwright/test";
import path from "path";

export const DOC_SCREENSHOT_DIR = path.join(__dirname, "../docs-screenshots");

export interface DocShotOptions {
  mask?: Locator[];
  fullPage?: boolean;
  locator?: Locator;
}

const HIDE_DEV_OVERLAY_CSS = "nextjs-portal { display: none !important; }";

const SAFE_NAME = /^[a-zA-Z0-9_-]+$/;

function safeScreenshotName(name: string): string {
  if (!SAFE_NAME.test(name)) {
    throw new Error(
      `Invalid screenshot name "${name}": only letters, digits, "-" and "_" are allowed.`,
    );
  }
  return name;
}

export async function docShot(
  page: Page,
  testInfo: TestInfo,
  name: string,
  options: DocShotOptions = {},
  delay: number = 2_000,
): Promise<string> {
  const file = path.join(DOC_SCREENSHOT_DIR, `${safeScreenshotName(name)}.png`);

  await page.waitForTimeout(delay);
  await page.addStyleTag({ content: HIDE_DEV_OVERLAY_CSS });

  const shotOptions = {
    path: file,
    animations: "disabled" as const,
    mask: options.mask,
  };

  if (options.locator) {
    await options.locator.screenshot(shotOptions);
  } else {
    await page.screenshot({ ...shotOptions, fullPage: options.fullPage });
  }

  await testInfo.attach(`${name}.png`, {
    path: file,
    contentType: "image/png",
  });

  return file;
}
