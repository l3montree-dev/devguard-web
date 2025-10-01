"use client";
import { createContext, useContext } from "react";
import { ArtifactDTO, AssetVersionDTO } from "../types/api/api";
import { NoopUpdater, WithUpdater } from "./ClientContextWrapper";

const AssetVersionContext = createContext<
  WithUpdater<{
    assetVersion: AssetVersionDTO;
    artifacts: ArtifactDTO[];
  } | null>
>({
  v: null,
  update: NoopUpdater,
});
export const AssetVersionProvider = AssetVersionContext.Provider;
export const useAssetVersion = () =>
  useContext(AssetVersionContext).v?.assetVersion;
export const useUpdateAssetVersionState = () =>
  useContext(AssetVersionContext).update;

export const useArtifacts = () =>
  useContext(AssetVersionContext).v?.artifacts || [];
