import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export class ShareFlow {
  constructor(private page: Page) {}

  async downloadSBOMFile() {
    await this.page
      .getByTestId("nav-asset-dependency-risks")
      .click({ timeout: 5_000 });
    await this.page.getByTestId("share-sbom-button").click();
    await this.page.getByTestId("download-sbom-json-format").waitFor({ state: "visible", timeout: 5_000 });
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.getByTestId("download-sbom-json-format").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  }

  async downloadVEXFile() {
    await this.page
      .getByTestId("nav-asset-dependency-risks")
      .click({ timeout: 5_000 });
    await this.page.getByTestId("share-vex-button").click();
    await this.page.getByTestId("download-vex-json-format").waitFor({ state: "visible", timeout: 5_000 });
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.getByTestId("download-vex-json-format").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  }
}
