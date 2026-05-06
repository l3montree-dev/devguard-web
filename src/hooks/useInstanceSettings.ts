import { useEffect, useState } from "react";
import { browserApiClient } from "../services/devGuardApi";
import type { InstanceSettings } from "@/types/api/api";

export const useInstanceSettings = () => {
  const [instanceSettings, setInstanceSettings] =
    useState<InstanceSettings | null>(null);

  useEffect(() => {
    browserApiClient("/instance-settings/")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data: InstanceSettings) => {
        if (data) setInstanceSettings(data);
      });
  }, []);

  return instanceSettings;
};
