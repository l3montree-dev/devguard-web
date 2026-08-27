// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type {
  AssetDTO,
  OrganizationDetailsDTO,
  ProjectDTO,
} from "@/types/api/api";

export type WithUpdater<T> = { v: T } & {
  update: (newValue: T | ((prev: T) => T)) => void;
};

export interface ContentTreeElement extends ProjectDTO {
  assets: Array<AssetDTO>;
}

export type OrgContextParams = {
  organization: OrganizationDetailsDTO | null;
  contentTree: ContentTreeElement[];
};
