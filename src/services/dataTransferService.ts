// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { apiFetch } from "@/services/apiClient";

export const exportArchive = (resourcePath: string) =>
  apiFetch(`${resourcePath}/export/`);

// The import is only available through the devguard-cli for now.
// The ImportSection component for it can be restored from commit 1f35e048.
// export const importArchive = (importPath: string, file: File) =>
//   apiFetch(importPath, {
//     method: "POST",
//     body: file,
//     headers: { "Content-Type": "application/x-tar" },
//   });
