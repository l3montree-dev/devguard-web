// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ExternalTicketProvider } from "@/types/common";

export const ExternalTicketProviderNames: {
  [key in ExternalTicketProvider]: string;
} = {
  github: "GitHub",
  gitlab: "GitLab",
  jira: "Jira",
  opencode: "openCode",
};
