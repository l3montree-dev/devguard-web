import useSWR from "swr";
import { browserApiClient } from "../services/devGuardApi";

const fetcher = (url: string, options?: RequestInit) =>
  browserApiClient(url, options).then((res) => {
    if (!res.ok) {
      throw new Error("An error occurred while fetching the data.");
    }
    return res.json();
  });

export default function useApi<T>(url: string, options?: RequestInit) {
  return useSWR<T>(url, fetcher);
}
