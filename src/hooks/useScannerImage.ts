// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWRImmutable from "swr/immutable";
import { fetchLatestScannerImage } from "../data-fetcher/fetchLatestScannerImage";

const DEFAULT_SCANNER_IMAGE = "ghcr.io/l3montree-dev/devguard/scanner:main";

export default function useScannerImage() {
  const { data } = useSWRImmutable(
    "latest-scanner-image",
    fetchLatestScannerImage,
  );

  return data ?? DEFAULT_SCANNER_IMAGE;
}
