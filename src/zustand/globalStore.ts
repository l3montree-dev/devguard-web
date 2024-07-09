import { Session } from "@ory/client";
import { StoreApi, createStore } from "zustand";
import { AssetDTO, OrganizationDTO, ProjectDTO } from "../types/api/api";
import { User } from "../types/auth";

export interface InitialState {
  session: Omit<Session, "identity"> & { identity: User };
  organizations: OrganizationDTO[];
}

export interface GlobalStoreActions {
  updateAsset: (asset: AssetDTO) => void;
}

export interface GlobalStore extends InitialState, GlobalStoreActions {
  project?: ProjectDTO;
  asset?: AssetDTO;
}
export const createGlobalStore = (
  preloadedState: Partial<GlobalStore> & {
    session: Omit<Session, "identity"> & { identity: User };
    organizations: OrganizationDTO[];
  },
) =>
  createStore<GlobalStore>((set, get) => {
    const state =
      typeof preloadedState === "string"
        ? JSON.parse(preloadedState)
        : preloadedState;

    return {
      updateAsset: (asset: AssetDTO) => {
        set({ asset });
      },
      ...state,
    };
  });
