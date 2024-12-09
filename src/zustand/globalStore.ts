import { Session } from "@ory/client";
import { createStore } from "zustand";
import {
  AssetDTO,
  OrganizationDetailsDTO,
  OrganizationDTO,
  ProjectDTO,
} from "../types/api/api";
import { User } from "../types/auth";

export interface ContentTreeElement {
  id: string;
  title: string;
  slug: string;
  assets: Array<{ id: string; title: string; slug: string }>;
}

export const normalizeContentTree = (
  contentTree: Array<ContentTreeElement>,
) => {
  const assetMap: {
    [key: string]: {
      id: string;
      title: string;
      slug: string;
      project: {
        id: string;
        title: string;
        slug: string;
      };
    };
  } = {};

  contentTree.forEach((element) => {
    element.assets.forEach((asset) => {
      assetMap[asset.id] = {
        id: asset.id,
        title: asset.title,
        slug: asset.slug,
        project: {
          id: element.id,
          title: element.title,
          slug: element.slug,
        },
      };
    });
  });

  return assetMap;
};

export interface InitialState {
  session: (Omit<Session, "identity"> & { identity: User }) | null;
  organizations: OrganizationDTO[];
  organization: OrganizationDetailsDTO;
  contentTree?: Array<ContentTreeElement>;

  isSidebarOpen: boolean;
}

export interface GlobalStoreActions {
  updateOrganization: (organization: OrganizationDetailsDTO) => void;
  updateAsset: (asset: AssetDTO) => void;
  updateProject: (project: ProjectDTO) => void;
  setSidebarOpen: (open: boolean) => void;
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
      setSidebarOpen: (open: boolean) => {
        set({
          isSidebarOpen: open,
        });
      },
      ...state,
    };
  });
