// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// avatarUrl is a pointer in Go, so it is nullable despite the spec declaring it
// required.
import type { components } from "@/types/api/generated";

type S = components["schemas"];

export type OrgAdmin = Omit<S["dtos.UserDTO"], "avatarUrl"> & {
  avatarUrl: string | null;
};

export type ExternalOrg = Omit<S["dtos.AdminsInOrg"], "admins"> & {
  admins: OrgAdmin[];
};

export interface InstanceDashboardHandle {
  refresh: () => void;
}

export interface InstanceTechnicalInfoHandle {
  refresh: () => void;
}

export interface Daemon {
  id: string;
  label: string;
  description: string;
  /** Admin API endpoint path (relative to /api/v1) */
  endpoint: string;
  /** Whether a body payload with assetId is needed */
  requiresAssetId?: boolean;
}

export interface InstanceAdminContextValue {
  /** Whether an admin signing key is currently held in memory. */
  isAuthenticated: boolean;
  /** Store the imported, non-extractable signing key in memory for this tab. */
  authenticate: (key: CryptoKey) => void;
  /** Drop the in-memory signing key. */
  logout: () => void;
  /** Reset the auto-logout timer back to the full session duration. */
  refreshSession: () => void;
  /** Retrieve the in-memory signing key. Returns null if not authenticated. */
  getSigningKey: () => CryptoKey | null;
  /** Absolute timestamp (ms) when the admin session is auto-cleared. */
  expiresAt: number | null;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  expiresAt: number | null;
}

export interface AdminDaemonSSEEvent {
  event: "log" | "done" | "error";
  data: string;
}

export interface VersionCheckResult {
  /** The latest release tag from GitHub, e.g. "v1.2.0" */
  latestVersion: string;
  /** The release URL on GitHub */
  latestUrl: string;
  /** Whether the running version is behind the latest release */
  updateAvailable: boolean;
}

// Instance-wide usage counters from `GET /admin/statistics/usage/`.
// NOTE: the backend `dtos.InstanceUsageStatistics` struct carries no `json`
// tags, so the serialized keys are the Go field names verbatim (PascalCase).
export interface InstanceUsageStatistics {
  NumberOfUsers: number;
  NumberOfOrganizations: number;
  NumberOfProjects: number;
  NumberOfAssetVersions: number;
  NumberOfTicketSyncedProjects: number;
  NumberOfProjectsWithGitlabIntegration: number;
}
