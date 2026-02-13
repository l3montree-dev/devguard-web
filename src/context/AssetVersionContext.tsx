"use client";
import { createContext, useContext } from "react";
import {
  ArtifactDTO,
  AssetVersionDTO,
  InformationSources,
} from "../types/api/api";
import { NoopUpdater, WithUpdater } from "./ClientContextWrapper";
import { fetcher } from "@/data-fetcher/fetcher";
import useSWR from "swr";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import useDecodedParams from "@/hooks/useDecodedParams";

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

export const useRootNodes = () => {
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const { data: rootNodes, mutate } = useSWR<{
    [artifactName: string]: InformationSources[];
  }>(
    "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/refs/" +
      assetVersionSlug +
      "/artifact-root-nodes",
    fetcher,
    {
      fallbackData: {},
    },
  );

  return { rootNodes: rootNodes || {}, mutate };
};
