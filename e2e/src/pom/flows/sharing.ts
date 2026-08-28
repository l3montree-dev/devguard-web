// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { expect } from "@playwright/test";
import { test, type Page } from "@playwright/test";
import { docShot } from "../../doc-shot";
import { RepoFlow } from "./repo";

export class ShareFlow {
  constructor(private page: Page) {}

  private repo(): RepoFlow {
    return new RepoFlow(this.page);
  }

  async downloadSBOMFile() {
    await this.repo().openDependencyRiskTable();
    await this.page.getByTestId("share-sbom-button").click();
    await this.page
      .getByTestId("download-sbom-json-format")
      .waitFor({ state: "visible", timeout: 5_000 });
    await docShot(this.page, test.info(), "download-sbom-document");
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.getByTestId("download-sbom-json-format").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  }

  async downloadVEXFile() {
    await this.repo().openDependencyRiskTable();
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
