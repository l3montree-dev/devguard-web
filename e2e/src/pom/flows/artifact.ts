import type { Page } from "@playwright/test";

export class ArtifactFlow {
  constructor(private page: Page) {}

  async createNewArtifact(name: string, url: string) {
    await this.page.getByTestId("nav-asset-artifacts").click();
    await this.page.getByTestId("create-artifact-button").click();
    await this.page.getByTestId("artifact-name-input").click();
    await this.page.getByTestId("artifact-name-input").fill(name);
    await this.page.getByTestId("sbom-url-upload-button").click();
    await this.page.getByTestId("upstream-url-field").click();
    await this.page.getByTestId("upstream-url-field").fill(url);
    await this.page.getByTestId("submit-artifact-button").click();
  }

  async deleteFirstArtifact() {
    await this.page.getByTestId("artifact-options-button").first().click();
    await this.page.getByTestId("delete-artifact-menu-item").click();
    await this.page.getByTestId("confirm-artifact-deletion").click();
  }
}
