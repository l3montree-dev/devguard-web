// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserApiClient } from "@/services/devGuardApi";

const DOWNLOAD_TIMEOUT_MS = 60 * 8 * 1000;

// Raw transport for browser file downloads (SBOM/VEX documents, PDF reports).
// Deliberately not the generated client: openapi-fetch parses the body by
// content type, while a download needs the untouched blob.
export const downloadFromApi = async (path: string, fileName: string) => {
  const response = await browserApiClient(path, {
    method: "GET",
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(response.statusText);

  const url = window.URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
