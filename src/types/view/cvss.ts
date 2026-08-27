// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export type CvssMetric = {
  key: string;
  field?: string;
  label: string;
  group?: string;
  options: { v: string; l: string }[];
  description?: string;
};
