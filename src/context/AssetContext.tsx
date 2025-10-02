"use client";
import { createContext, useContext } from "react";
import { AssetDTO } from "../types/api/api";
import { NoopUpdater, WithUpdater } from "./ClientContextWrapper";

const AssetContext = createContext<WithUpdater<AssetDTO | null>>({
  v: null,
  update: NoopUpdater,
});
export const AssetProvider = AssetContext.Provider;
export const useAsset = () => useContext(AssetContext).v;
export const useUpdateAsset = () => useContext(AssetContext).update;
