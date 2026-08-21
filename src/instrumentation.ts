// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import * as Sentry from "@sentry/nextjs";

export async function register() {
  await import("../sentry.server.config");
}

export const onRequestError = Sentry.captureRequestError;
