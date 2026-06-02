import type { Page } from "@playwright/test";

export class SetupFlow {
  constructor(private page: Page) {}

  async setupFlow_setupRiskScanning() {
    await this.page.getByTestId("setup-risk-scanning-button").click();
    await this.page.waitForTimeout(500);
    await this.page.getByTestId("own-setup-card").click();
    await this.page.getByTestId("scanner-selection-continue").click();
  }

  async setupFlow_selectManualUpload() {
    await this.page.waitForTimeout(500);
    await this.page.getByTestId("manual-upload-card").click();
    await this.page.getByTestId("integration-method-selection-continue").click();
  }

  async setupFlow_uploadSbomFile(inputFile: string) {
    await this.page.waitForTimeout(500);
    await this.page.getByTestId("sbom-tab").click();
    await this.page.getByTestId("file-upload-input").setInputFiles(inputFile);
    await this.page.getByTestId("manual-integration-continue").click();
  }
}
