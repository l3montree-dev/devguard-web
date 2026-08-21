// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export interface CheckResult {
  packagePurl: string;
  blocked: boolean;
  matchedRule: string;
}

export interface DependencyProxyConfig {
  rules: string;
  minReleaseAge: number;
}
