"use client";
import { createContext, useContext } from "react";
import { AssetVersionDTO } from "../types/api/api";
import { NoopUpdater, WithUpdater } from "./ClientContextWrapper";

const AssetVersionContext = createContext<WithUpdater<AssetVersionDTO | null>>({
  v: null,
  update: NoopUpdater,
});
export const AssetVersionProvider = AssetVersionContext.Provider;
export const useAssetVersion = () => useContext(AssetVersionContext).v;
export const useUpdateAssetVersion = () =>
  useContext(AssetVersionContext).update;
