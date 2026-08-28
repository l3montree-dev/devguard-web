// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { Page } from "@playwright/test";

export class AdvisoryHelper {
  constructor(private page: Page) {}

  async createNewAdvisory(
    title: string,
    description: string,
    vector: string,
    ecosystem: string,
    packageName: string,
    semverStart: string,
    semverEnd: string,
  ) {
    await this.page.getByTestId("title-security-advisory").click();
    await this.page.getByTestId("title-security-advisory").fill(title);
    await this.page
      .getByRole("textbox", { name: "### Summary Short summary of" })
      .click();
    await this.page
      .getByRole("textbox", { name: "### Summary Short summary of" })
      .fill(description);
    await this.page.getByTestId("vectorString-security-advisory").click();
    await this.page.getByTestId("vectorString-security-advisory").fill(vector);
    await this.page.getByTestId("ecosystem-security-advisory").click();
    await this.page.getByTestId("ecosystem-security-advisory").fill(ecosystem);
    await this.page.getByTestId("packageName-security-advisory").click();
    await this.page
      .getByTestId("packageName-security-advisory")
      .fill(packageName);
    await this.page.getByTestId("semverStart-security-advisory").click();
    await this.page
      .getByTestId("semverStart-security-advisory")
      .fill(semverStart);
    await this.page.getByTestId("semverEnd-security-advisory").click();
    await this.page.getByTestId("semverEnd-security-advisory").fill(semverEnd);
    await this.page.getByTestId("submit-security-advisory").click();
  }
}
