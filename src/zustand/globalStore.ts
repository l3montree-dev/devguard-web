import { Session } from "@ory/client";
import { useMemo } from "react";
import { StoreApi, UseBoundStore, create } from "zustand";
import { OrganizationDTO } from "../types/api";
import { User } from "../types/auth";
import { localStore } from "../services/localStore";

export interface GlobalStore {
  session: Omit<Session, "identity"> & { identity: User };
  activeOrganization?: OrganizationDTO; // the current selected organization
  organizations: OrganizationDTO[];

  setActiveOrganization: (organization: OrganizationDTO) => void;
  clientInit: () => void;
}

let store: UseBoundStore<StoreApi<GlobalStore>> | undefined;

const initStore = (
  preloadedState: Partial<GlobalStore> & {
    session: Omit<Session, "identity"> & { identity: User };
    organizations: OrganizationDTO[];
  },
) =>
  create<GlobalStore>((set, get) => {
    console.log(preloadedState);
    return {
      ...preloadedState,
      setActiveOrganization: (organization: OrganizationDTO) =>
        set((state) => ({ ...state, activeOrganization: organization })),
      clientInit: () => {
        // we can use any browser apis
        const activeOrg = localStore.get(
          "activeOrganization",
          get().organizations[0]?.id,
        );

        const org = get().organizations.find((o) => o.id === activeOrg);
        if (org) {
          localStore.set("activeOrganization", org.id);
          set((state) => ({ ...state, activeOrganization: org }));
        }
      },
    };
  });

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

export function useHydrate(initialState: Partial<GlobalStore> | string) {
  const state =
    typeof initialState === "string" ? JSON.parse(initialState) : initialState;
  const store = useMemo(() => initializeStore(state), [state]);
  return store;
}
