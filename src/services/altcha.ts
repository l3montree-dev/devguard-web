// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import { create, randomInt } from "altcha-lib/frameworks/nextjs";
import { ALTCHA_COOKIE_NAME } from "@/const/altcha";

const CHALLENGE_TTL_SECONDS = 15 * 60;

export const altcha = create({
  hmacSignatureSecret: process.env.ALTCHA_HMAC_SECRET,
  deriveKey,
  createChallengeParameters: () => ({
    algorithm: "PBKDF2/SHA-256",
    cost: 7_000,
    counter: randomInt(5_000, 10_000),
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000),
  }),
  setCookie: {
    name: ALTCHA_COOKIE_NAME,
    path: "/",
    sameSite: "Strict",
    maxAge: CHALLENGE_TTL_SECONDS,
  },
});
