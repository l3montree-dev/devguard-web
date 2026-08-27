"use client";
import React from "react";
import { config } from "../config";
import { NoopUpdater } from "./ClientContextWrapper";
import type { WithUpdater } from "./ClientContextWrapper";
import type { InstanceSettings } from "@/types/api/api";

const ConfigContext = React.createContext<
  WithUpdater<typeof config & Partial<InstanceSettings>>
>({
  v: config,
  update: NoopUpdater,
});
export const ConfigProvider = ConfigContext.Provider;
export const useConfig = () => React.useContext(ConfigContext).v;
