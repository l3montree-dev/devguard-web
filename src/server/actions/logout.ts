"use server";

import { getLogoutFlow } from "@ory/nextjs/app";

export async function getLogoutUrl() {
  const flow = await getLogoutFlow();
  return flow.logout_url;
}
