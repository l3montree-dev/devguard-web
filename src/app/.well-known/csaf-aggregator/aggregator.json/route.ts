// just return whatever we fetch from

import { getApiClientInRouteHandler } from "../../../../services/devGuardApiAppRouter";

export async function GET(request: Request) {
  const client = getApiClientInRouteHandler(request);
  // just do a fetch to the same route
  const response = await client(
    "/.well-known/csaf-aggregator/aggregator.json",
    {
      method: "GET",
    },
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
