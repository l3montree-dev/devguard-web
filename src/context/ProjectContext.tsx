"use client";
import { createContext, useContext } from "react";
import type { AssetDTO, ProjectDTO } from "../types/api/api";
import type { WithUpdater } from "./ClientContextWrapper";

const ProjectContext = createContext<
  WithUpdater<(ProjectDTO & { assets: AssetDTO[] }) | null>
>({ v: null, update: () => {} });
export const ProjectProvider = ProjectContext.Provider;
export const useProject = () => useContext(ProjectContext).v;
export const useUpdateProject = () => useContext(ProjectContext).update;
