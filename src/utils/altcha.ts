// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ALTCHA_PROTECTED_PATHS } from "@/const/altcha";

export const isAltchaProtected = (
  method: string | undefined,
  pathname: string,
) => method?.toUpperCase() === "POST" && ALTCHA_PROTECTED_PATHS.has(pathname);
