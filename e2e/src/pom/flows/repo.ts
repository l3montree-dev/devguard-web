import type { Page } from "@playwright/test";

export class RepoFlow {
  constructor(private page: Page) {}

  async createGitHubRepo(name: string, description: string) {
    await this.page
      .getByTestId("create-repository-button")
      .click({ timeout: 30_000 });
    await this.page
      .getByTestId("repository-name")
      .waitFor({ state: "visible" });
    await this.page.getByTestId("repository-name").click();
    await this.page.getByTestId("repository-name").fill(name);
    await this.page.getByTestId("repository-description").click();
    await this.page.getByTestId("repository-description").fill(description);
    await this.page.getByTestId("create-repository-submit-button").click();
  }

  async createGitLabRepo(name: string, description: string) {
    await this.page
      .getByTestId("create-repository-button")
      .click({ timeout: 30_000 });
    await this.page
      .getByTestId("repository-name")
      .waitFor({ state: "visible" });
    await this.page.getByTestId("repository-name").click();
    await this.page.getByTestId("repository-name").fill(name);
    await this.page.getByTestId("repository-description").click();
    await this.page.getByTestId("repository-description").fill(description);
    await this.page.getByTestId("gitlab-repository-provider-button").click();
    await this.page.getByTestId("create-repository-submit-button").click();
  }

  async deleteRepo() {
    await this.page
      .locator(".level-repo")
      .getByTestId("repository-settings")
      .click({ timeout: 30_000 });
    await this.page.getByTestId("delete-repository-button").click();
    await this.page.getByTestId("alert-confirm-button").click();
  }

  async settingClickthroughRepo() {
    await this.page.getByTestId("repository-settings").click();
    await this.page
      .getByTestId("configure-security-requirements-button")
      .click();
    await this.page.getByTestId("confidentiality-requirement-low").click();
    await this.page.getByTestId("integrity-requirement-high").click();
    await this.page.getByTestId("availability-requirement-low").click();
    await this.page.getByTestId("save-security-requirements-button").click();
    await this.page.getByTestId("enable-public-access-switch").click();
    await this.page.getByTestId("vuln-auto-reopen-switch").click();
    await this.page
      .getByTestId("save-vulnerability-management-settings-button")
      .click();
  }
}
