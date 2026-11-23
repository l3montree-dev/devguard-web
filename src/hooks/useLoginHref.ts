// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { getLoginHref } from "@/utils/auth";

export function useLoginHref() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString();
  const currentUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;

  return getLoginHref(currentUrl);
}
