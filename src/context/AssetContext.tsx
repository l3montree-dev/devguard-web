// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import { createContext, useContext } from "react";
import type { AssetDetailsDTO } from "@/types/dto";
import { NoopUpdater } from "./ClientContextWrapper";
import type { WithUpdater } from "@/types/view/context";

const AssetContext = createContext<
  WithUpdater<(AssetDetailsDTO & { webhookSecret?: string }) | null>
>({
  v: null,
  update: NoopUpdater,
});
export const AssetProvider = AssetContext.Provider;
export const useAsset = () => useContext(AssetContext).v;
export const useUpdateAsset = () => useContext(AssetContext).update;
