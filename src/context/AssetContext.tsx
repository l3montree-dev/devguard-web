// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import { createContext, useContext } from "react";
import type { AssetDTO } from "../types/api/api";
import { NoopUpdater } from "./ClientContextWrapper";
import type { WithUpdater } from "@/types/view/context";

const AssetContext = createContext<WithUpdater<AssetDTO | null>>({
  v: null,
  update: NoopUpdater,
});
export const AssetProvider = AssetContext.Provider;
export const useAsset = () => useContext(AssetContext).v;
export const useUpdateAsset = () => useContext(AssetContext).update;
