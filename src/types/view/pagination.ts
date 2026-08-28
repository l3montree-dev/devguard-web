// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
