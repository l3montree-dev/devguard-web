import { expect } from "@playwright/test";
import { test, type Page } from "@playwright/test";
import { ModalHelper } from "./modal-helper";
import { docShot } from "../../doc-shot";

export class ShareFlow {
  constructor(private page: Page) {}

  async downloadSBOMFile() {
    // Follows the SBOM upload, whose toast covers the asset nav.
    await new ModalHelper(this.page).dismissToastIfPresent();
    await this.page
      .getByTestId("nav-asset-dependency-risks")
      .locator("a")
      .click({ timeout: 5_000 });
    await this.page.getByTestId("share-sbom-button").click();
    await this.page
      .getByTestId("download-sbom-json-format")
      .waitFor({ state: "visible", timeout: 5_000 });
    await docShot(this.page, test.info(), "download-sbom-document")
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.getByTestId("download-sbom-json-format").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  }

  async downloadVEXFile() {
    // Follows VEX rule creation, whose toast covers the asset nav.
    await new ModalHelper(this.page).dismissToastIfPresent();
    await this.page
      .getByTestId("nav-asset-dependency-risks")
      .locator("a")
      .click({ timeout: 5_000 });
    await this.page.getByTestId("share-vex-button").click();
    await this.page
      .getByTestId("download-vex-json-format")
      .waitFor({ state: "visible", timeout: 5_000 });
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.getByTestId("download-vex-json-format").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  }
}
