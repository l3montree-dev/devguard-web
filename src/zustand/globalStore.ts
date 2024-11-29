import { Session } from "@ory/client";
import { createStore } from "zustand";
import {
  AssetDTO,
  OrganizationDetailsDTO,
  OrganizationDTO,
  ProjectDTO,
} from "../types/api/api";
import { User } from "../types/auth";

export interface InitialState {
  session: (Omit<Session, "identity"> & { identity: User }) | null;
  organizations: OrganizationDTO[];
  organization: OrganizationDetailsDTO;
  contentTree: Array<{
    id: string;
    title: string;
    slug: string;
    assets: Array<{ id: string; title: string; slug: string }>;
  }>;
}

export interface GlobalStoreActions {
  updateOrganization: (organization: OrganizationDetailsDTO) => void;
  updateAsset: (asset: AssetDTO) => void;
  updateProject: (project: ProjectDTO) => void;
}

export interface GlobalStore extends InitialState, GlobalStoreActions {
  project?: ProjectDTO;
  asset?: AssetDTO;
}
export const createGlobalStore = (
  preloadedState: Partial<GlobalStore> & {
    session: Omit<Session, "identity"> & { identity: User };
    organizations: OrganizationDTO[];
    organization: OrganizationDetailsDTO;
  },
) =>
  createStore<GlobalStore>((set, get) => {
    const state =
      typeof preloadedState === "string"
        ? JSON.parse(preloadedState)
        : preloadedState;

    return {
      updateOrganization: (organization: OrganizationDetailsDTO) => {
        set({ organization });
      },
      updateProject: (project: ProjectDTO) => {
        set({ project });
      },
      updateAsset: (asset: AssetDTO) => {
        set({ asset });
      },
      ...state,
    };
  });
