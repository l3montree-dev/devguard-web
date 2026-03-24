import { browserApiClient } from "../services/devGuardApi";

export class FetcherError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    Object.setPrototypeOf(this, FetcherError.prototype);
    this.name = "FetcherError";
    this.status = status;
  }
}

export const fetcher = <T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> =>
  browserApiClient(url, options).then(async (res) => {
    if (!res.ok) {
      throw new FetcherError(
        "An error occurred while fetching the data.",
        res.status,
      );
    }

    return res.json();
  });
