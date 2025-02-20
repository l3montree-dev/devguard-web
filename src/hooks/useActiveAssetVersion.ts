import { useStore } from "@/zustand/globalStoreProvider";
import { useMemo } from "react";
import { useActiveAsset } from "./useActiveAsset";

export function useActiveAssetVersion() {
  return useStore((s) => {
    return s.assetVersion;
  });
}

export function useAssetBranchesAndTags() {
  const activeAsset = useActiveAsset();

  const branches = useMemo(() => {
    if (activeAsset) {
      return activeAsset.refs
        .filter((v) => v.type === "branch")
        .map((v) => v.name);
    }
    return [];
  }, [activeAsset]);

  const tags = useMemo(() => {
    if (activeAsset) {
      return activeAsset.refs
        .filter((v) => v.type === "tag")
        .map((v) => v.name);
    }
    return [];
  }, [activeAsset]);

  return { branches, tags };
}
