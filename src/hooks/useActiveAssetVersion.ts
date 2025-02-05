import { AssetVersionDTO } from "@/types/api/api";
import { useStore } from "@/zustand/globalStoreProvider";

export function useActiveAssetVersion() {
  return useStore((s) => {
    return s.assetVersion;
  });
}
