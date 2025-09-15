import { browserApiClient } from "../services/devGuardApi";

export const fetcher: any = (url: string, options?: RequestInit) =>
  browserApiClient(url, options).then(async (res) => {
    if (!res.ok) {
      throw new Error("An error occurred while fetching the data.");
    }

    return res.json();
  });
