import useSWR from "swr";
import { browserApiClient } from "../services/devGuardApi";
import type { InstanceInfo, InstanceSettings } from "@/types/api/api";

const fetcher = (url: string) =>
  browserApiClient(url).then((res) => (res.ok ? res.json() : null));

export const useInstanceSettings = () => {
  const { data } = useSWR<InstanceSettings>("/instance-settings/", fetcher);
  const { data: info } = useSWR<InstanceInfo>("/info/", fetcher);

  if (!data) return null;

  return {
    ...data,
    apiVersion: info?.build.version ?? null,
    // omitted by the API until the first vulndb import finished
    vulndbVersion: info?.database.vulndbVersion ?? null,
    // null while /info is still unknown - only false means "not imported yet"
    vulndbInitialized: info ? Boolean(info.database.vulndbVersion) : null,
  };
};
