// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { connection } from "next/server";
import { config } from "@/config";
import { altcha } from "@/services/altcha";

export async function GET(request: Request) {
  await connection();
  if (!config.altchaEnabled) {
    return new Response(null, { status: 404 });
  }
  return altcha.challengeHandler(request);
}
