// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

export const openSettingsSection = (page: Page, segment: string) =>
  page.getByTestId(`settings-nav-${segment}`).filter({ visible: true }).click();
