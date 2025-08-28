import { ArtifactDTO } from "@/types/api/api";
import { useStore } from "../zustand/globalStoreProvider";

export function useArtifacts(): ArtifactDTO[] {
  return useStore((s) => {
    // should only be used in organization slug pages
    // an organization cant be undefined in this subrouter - see the applied middleware
    return s.artifacts || [];
  });
}
