import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/auth";

interface GlobalStore {
  user?: User; // if user is defined, it means that the user is logged in
  setUser: (user: User) => void;
}

const globalStore = create(
  persist<GlobalStore>(
    (set, get) => ({
      user: undefined, // gets set inside the Bootstrap component
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "global-store",
    },
  ),
);

// make sure that it works using nextjs
// https://docs.pmnd.rs/zustand/integrations/persisting-store-data#usage-in-next.js
export function useGlobalStore(): GlobalStore | undefined;
export function useGlobalStore<F>(
  callback: (state: GlobalStore) => F,
): F | undefined;
export function useGlobalStore<F>(
  callback: (state: GlobalStore) => F = (s: GlobalStore) => s as F,
) {
  const result = globalStore(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
}

export default useGlobalStore;
