// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import React from "react";
import { config } from "../config";
import { NoopUpdater } from "./ClientContextWrapper";
import type { InstanceSettings } from "@/types/api/api";
import type { WithUpdater } from "../types/view/context";

const ConfigContext = React.createContext<
  WithUpdater<typeof config & Partial<InstanceSettings>>
>({
  v: config,
  update: NoopUpdater,
});
export const ConfigProvider = ConfigContext.Provider;
export const useConfig = () => React.useContext(ConfigContext).v;
