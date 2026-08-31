// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { OrganizationDetailsDTO } from "@/types/dto";
import type { components } from "@/types/api/generated";

export type WithUpdater<T> = { v: T } & {
  update: (newValue: T | ((prev: T) => T)) => void;
};

export type ContentTreeElement = components["schemas"]["dtos.ProjectDTO"];

export type OrgContextParams = {
  organization: OrganizationDetailsDTO | null;
  contentTree: ContentTreeElement[];
};
