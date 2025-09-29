"use client";
import { createContext, useContext } from "react";
import { AssetDTO } from "../types/api/api";

const AssetContext = createContext<AssetDTO | null>(null);
export const AssetProvider = AssetContext.Provider;
export const useAsset = () => useContext(AssetContext);
