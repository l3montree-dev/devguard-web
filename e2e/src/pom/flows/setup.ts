import type { Page } from "@playwright/test";

export class SetupFlow {
  constructor(private page: Page) {}

  async setupOwnRiskScanning() {
    await this.page.getByTestId("manual-upload-card").click();
    await this.page.waitForTimeout(500);
    await this.page.getByTestId("upload-manually").click();
  }

  async uploadSbomFile(inputFile: string) {
    await this.page.waitForTimeout(500);
    await this.page.getByTestId("sbom-tab").click();
    await this.page
      .getByTestId("file-upload-input-file-upload-sbom")
      .setInputFiles(inputFile);
    await this.page.getByTestId("manual-integration-continue").click();
  }

  async setupAutoRiskScanning() {
    await this.page.waitForTimeout(500);
    await this.page.getByTestId("gitlab-connect-repository").click();
  }

  async createGitLabIntegration(name: string, url: string, token: string) {
    await this.page.getByTestId("gitlab-pat-name").click();
    await this.page.getByTestId("gitlab-pat-name").fill(name);
    await this.page.getByTestId("gitlab-base-url-input").click();
    await this.page.getByTestId("gitlab-base-url-input").fill(url);
    await this.page.getByTestId("gitlab-pat-input").click();
    await this.page.getByTestId("gitlab-pat-input").fill(token);
    await this.page.getByTestId("gitlab-pat-save-button").click();
  }

  async selectGitLabRepo() {
    await this.page.getByTestId("repo-selector").click();
    await this.page.getByTestId("repo-selector-option").first().click();
    await this.page.getByTestId("connect-repository-button").click();
    await this.page.getByTestId("continue-connect-repository-button").click();
    await this.page.waitForTimeout(1000);
  }

  async startAutoSetupGitLab() {
    await this.page.getByTestId("use-autosetup-button").click();
    await this.page
      .getByTestId("view-merge-request-button")
      .waitFor({ state: "visible" });
  }

  async uploadVEX(inputFile: string) {
    await this.page
      .getByTestId("nav-asset-vex-rules")
      .click({ timeout: 20_000 });
    await this.page.getByTestId("upload-vex-button").click();
    await this.page.getByTestId("upload-vex-file").click();
    await this.page
      .getByTestId("file-upload-input-file-upload-vex")
      .setInputFiles(inputFile);
    await this.page.getByTestId("upload-vex-file-selected-button").click();
  }
}
