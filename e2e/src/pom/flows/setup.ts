// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { Page } from "@playwright/test";
import { RepoFlow } from "./repo";

export class SetupFlow {
  constructor(private page: Page) {}

  private repo(): RepoFlow {
    return new RepoFlow(this.page);
  }

  async uploadSbomFile(inputFile: string) {
    // the onboarding page has a single upload field which detects the file type
    await this.page
      .getByTestId("file-upload-input-onboarding-upload")
      .setInputFiles(inputFile);
    await this.page.getByTestId("onboarding-upload-submit").click();
    await this.page.waitForURL(/\/(dependency-risks|code-risks|vex-rules)/);
  }

  async setupAutoRiskScanning() {
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
  }

  async startAutoSetupGitLab() {
    await this.page.getByTestId("use-autosetup-button").click();
    await this.page
      .getByTestId("view-merge-request-button")
      .waitFor({ state: "visible" });
  }

  async uploadVEX(inputFile: string) {
    await this.page.getByTestId("nav-asset-dependency-risks-chevron").click();
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
