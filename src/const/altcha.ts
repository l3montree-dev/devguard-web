// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export const ALTCHA_CHALLENGE_URL = "/api/altcha/challenge";

export const ALTCHA_COOKIE_NAME = "altcha";

export const ALTCHA_PROTECTED_PATHS = new Set([
  "/self-service/login",
  "/self-service/registration",
  "/self-service/recovery",
  "/self-service/verification",
]);
