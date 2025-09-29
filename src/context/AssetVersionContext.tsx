"use client";
import { createContext, useContext } from "react";
import { AssetVersionDTO } from "../types/api/api";

const AssetVersionContext = createContext<AssetVersionDTO | null>(null);
export const AssetVersionProvider = AssetVersionContext.Provider;
export const useAssetVersion = () => useContext(AssetVersionContext);
