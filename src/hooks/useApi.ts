import { browserApiClient } from "../services/devGuardApi";

export const fetcher = <T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> =>
  browserApiClient(url, options).then(async (res) => {
    if (!res.ok) {
      throw new Error("An error occurred while fetching the data.");
    }

    return res.json();
  });
