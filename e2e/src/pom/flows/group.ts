// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { test, type Page } from "@playwright/test";
import { DevGuardNavigationLevel } from "../devguard";
import { docShot } from "../../doc-shot";

export class GroupFlow {
  constructor(private page: Page) {}

  async createGroup(name: string, description: string) {
    const inlineForm = this.page.getByTestId("create-group-form");
    await inlineForm
      .or(this.page.getByTestId("create-group-button"))
      .first()
      .waitFor({ state: "visible", timeout: 15_000 });
    if (!(await inlineForm.isVisible())) {
      await this.page
        .getByTestId("create-group-button")
        .click({ timeout: 10_000 });
    }
    await this.page.getByTestId("group-name").waitFor({ state: "visible" });
    await this.page.getByTestId("group-name").click();
    await this.page.getByTestId("group-name").fill(name);
    await this.page.getByTestId("group-description").click();
    await this.page.getByTestId("group-description").fill(description);
    await this.page.getByTestId("create-group-submit-button").click();
    await docShot(this.page, test.info(), "repo-creation-screen");
  }

  async openSubgroupsAndRepositories() {
    await this.page
      .locator(
        `${DevGuardNavigationLevel.Group} [data-testid="nav-group-subgroups-repositories"]`,
      )
      .click({ timeout: 10_000 });
    await this.page
      .getByTestId("create-repository-button")
      .or(this.page.getByTestId("create-repository-form"))
      .first()
      .waitFor({ state: "visible", timeout: 10_000 });
  }

  async createNewSubgroup() {
    await this.page.getByTestId("nav-group-subgroups-repositories").click();
    // an empty group shows the create forms inline behind tabs instead of a button
    const inlineTab = this.page.getByTestId("create-subgroup-tab");
    await inlineTab
      .or(this.page.getByTestId("create-subgroup-button"))
      .first()
      .waitFor({ state: "visible", timeout: 10_000 });
    if (await inlineTab.isVisible()) {
      await inlineTab.click();
    } else {
      await this.page.getByTestId("create-subgroup-button").click();
    }
    await this.page.getByTestId("group-name").waitFor({ state: "visible" });
    await this.page.getByTestId("group-name").fill("Test");
    await this.page.getByTestId("group-description").click();
    await this.page.getByTestId("group-description").fill("Test");
    await this.page.getByTestId("create-group-submit-button").click();
  }

  async checkHeaderGroup() {
    await this.page
      .getByRole("link", { name: "Test Group" })
      .first()
      .click({ timeout: 10_000 });
    await this.page.getByTestId("nav-group-overview").click();
    await this.page.getByTestId("nav-group-releases").click();
    await this.page.getByTestId("nav-group-subgroups-repositories").click();
    await this.page.getByTestId("nav-group-package-search").click();
    await this.page.getByTestId("nav-group-settings").click();
  }

  async publishGroup() {
    await this.page.getByTestId("nav-group-settings").click();
    await this.page.getByTestId("public-group-switch").click();
  }
}
