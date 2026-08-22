// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export interface FilterOption {
  label: string;
  value: string;
  operators: Array<{ value: string; label?: string }>;
  filterValues?: Array<{ value: string; label?: string }>;
}

export type Step = "label" | "operator" | "value";

export interface FilterForm {
  field: string;
  operator: string;
  value: string;
}

export interface SortOption {
  label: string;
  value: string;
}
