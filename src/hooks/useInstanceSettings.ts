import useSWR from "swr";
import { browserApiClient } from "../services/devGuardApi";
import type { InstanceSettings } from "@/types/api/api";

const fetcher = (url: string) =>
  browserApiClient(url).then((res) => (res.ok ? res.json() : null));

export const useInstanceSettings = () => {
  const { data } = useSWR<InstanceSettings>("/instance-settings/", fetcher);
  return data ?? null;
};
