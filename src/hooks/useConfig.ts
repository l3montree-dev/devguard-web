import { useStore } from "../zustand/globalStoreProvider";

export default function useConfig() {
  return useStore((s) => {
    return s.config;
  });
}
