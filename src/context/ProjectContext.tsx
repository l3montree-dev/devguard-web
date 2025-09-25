"use client";
import { createContext, useContext } from "react";
import { AssetDTO, ProjectDTO } from "../types/api/api";
import { WithUpdater } from "./ClientContextWrapper";

const ProjectContext = createContext<
  (ProjectDTO & { assets: AssetDTO[] }) | null
>(null);
export const ProjectProvider = ProjectContext.Provider;
export const useProject = () => useContext(ProjectContext);
