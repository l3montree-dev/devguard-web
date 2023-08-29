import { Session } from "@ory/client";
import { useMemo } from "react";
import { StoreApi, UseBoundStore, create } from "zustand";
import { User } from "../types/auth";
import { OrganizationDTO } from "../types/api";

export interface GlobalStore {
  session?: Omit<Session, "identity"> & { identity: User };
  organization?: OrganizationDTO; // the current selected organization
}

let store: UseBoundStore<StoreApi<GlobalStore>> | undefined;

const initStore = (preloadedState: Partial<GlobalStore>) =>
  create<GlobalStore>((set) => ({
    ...preloadedState,
  }));

export const initializeStore = (preloadedState: GlobalStore) => {
  let _store = store ?? initStore(preloadedState);

  // After navigating to a page with an initial Zustand state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState,
    });
    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export function useHydrate(initialState: Partial<GlobalStore>) {
  const state =
    typeof initialState === "string" ? JSON.parse(initialState) : initialState;
  const store = useMemo(() => initializeStore(state), [state]);
  return store;
}
