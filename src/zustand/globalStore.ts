import { Session } from "@ory/client";
import { createStore } from "zustand";
import {
  ArtifactDTO,
  AssetDTO,
  AssetVersionDTO,
  OrganizationDetailsDTO,
  OrganizationDTO,
  ProjectDTO,
} from "../types/api/api";
import { User } from "../types/auth";

export interface ContentTreeElement extends ProjectDTO {
  assets: Array<AssetDTO>;
}

export const normalizeContentTree = (
  contentTree: Array<ContentTreeElement>,
) => {
  const assetMap: {
    [key: string]:
      | (AssetDTO & {
          project: ProjectDTO;
        })
      | undefined;
  } = {};

  contentTree.forEach((element) => {
    element.assets.forEach((asset) => {
      assetMap[asset.id] = {
        ...asset,
        project: {
          ...element,
          // @ts-expect-error
          assets: undefined, // remove assets to avoid circular reference
        },
      };
    });
  });
  console.log("Normalized asset map:", assetMap);

  return assetMap;
};

export interface InitialState {
  session: (Omit<Session, "identity"> & { identity: User }) | null;
  organizations: OrganizationDTO[];
  organization: OrganizationDetailsDTO;
  contentTree?: Array<ContentTreeElement>;

  apiUrl: string;
  isSidebarOpen: boolean;
}

export interface GlobalStoreActions {
  updateOrganization: (organization: OrganizationDetailsDTO) => void;
  updateOrganizations: (organizations: OrganizationDTO[]) => void;
  updateAsset: (asset: AssetDTO) => void;
  updateAssetVersions: (assetVersion: AssetVersionDTO) => void;
  updateProject: (project: ProjectDTO) => void;
  setSidebarOpen: (open: boolean) => void;
}

export interface GlobalStore extends InitialState, GlobalStoreActions {
  project?: ProjectDTO;
  asset?: AssetDTO;
  assetVersion?: AssetVersionDTO;
  artifacts?: ArtifactDTO[];
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
      updateAssetVersions: (assetVersion: AssetVersionDTO) => {
        set({ assetVersion });
      },
      updateOrganizations: (organizations: OrganizationDTO[]) => {
        set({ organizations });
      },
      setSidebarOpen: (open: boolean) => {
        set({
          isSidebarOpen: open,
        });
      },
      ...state,
    };
  });
