// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { usePathname } from "next/navigation";

export default function useDecodedPathname() {
  const pathname = usePathname();
  return decodeURIComponent(pathname || "");
}
