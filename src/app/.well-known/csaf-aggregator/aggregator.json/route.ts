// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// just return whatever we fetch from

import { streamFromApiWithRequest } from "@/services/streamingClient";

export async function GET(request: Request) {
  const response = await streamFromApiWithRequest(
    request,
    "/.well-known/csaf-aggregator/aggregator.json/",
  );

  // return the response as is
  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
