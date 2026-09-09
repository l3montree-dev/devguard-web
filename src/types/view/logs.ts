// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// Mirrors gorm.io/gorm/logger.LogLevel - note there is no "Debug" level, and
// the backend serializes it as a plain integer, not a string.
export enum LogLevel {
  Silent = 1,
  Error = 2,
  Warn = 3,
  Info = 4,
}

// Mirrors the backend's database/models.Log struct.
export interface Log {
  id: string;
  orgID: string;
  projectID: string;
  assetID: string;
  assetVersionName: string;
  createdAt: string;
  logLevel: LogLevel;
  message: string;
}
