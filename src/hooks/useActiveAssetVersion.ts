import { useStore } from "@/zustand/globalStoreProvider";
import { useMemo } from "react";
import { useActiveAsset } from "./useActiveAsset";
import { GlobalStore } from "../zustand/globalStore";

const assetVersionSelector = (s: GlobalStore) => {
  if (s.assetVersion) {
    // make sure the asset version is the same as the active asset
    if (s.assetVersion.assetId === s.asset?.id) {
      return s.assetVersion;
    }
  }
  return undefined;
};

export function useActiveAssetVersion() {
  return useStore(assetVersionSelector);
}

export function useAssetBranchesAndTags() {
  const activeAsset = useActiveAsset();

  const branches = useMemo(() => {
    if (activeAsset) {
      return activeAsset.refs.filter((v) => v.type === "branch");
    }
    return [];
  }, [activeAsset]);

  const tags = useMemo(() => {
    if (activeAsset) {
      return activeAsset.refs.filter((v) => v.type === "tag");
    }
    return [];
  }, [activeAsset]);

  return { branches, tags };
}
