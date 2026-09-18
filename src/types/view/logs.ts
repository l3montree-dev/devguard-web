// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// Mirrors gorm.io/gorm/logger.LogLevel - note there is no "Debug" level, and
// the backend serializes it as a plain integer, not a string.
export enum LogLevel {
  Silent = "silent",
  Error = "error",
  Warn = "warn",
  Info = "info",
}

// Mirrors the backend's dtos.LogDTO. A log is always scoped to an
// organization; projectID and assetID narrow it further and are null for logs
// that do not belong to one.
export interface Log {
  id: string;
  orgID: string;
  projectID: string | null;
  assetID: string | null;
  createdAt: string;
  logLevel: LogLevel;
  message: string;
  projectName?: string | null;
  assetName?: string | null;
  projectSlug?: string;
  assetSlug?: string;
}
