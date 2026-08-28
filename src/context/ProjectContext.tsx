// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import { createContext, useContext } from "react";
import type { AssetDTO, ProjectDetailsDTO } from "@/types/dto";
import type { WithUpdater } from "@/types/view/context";

const ProjectContext = createContext<
  WithUpdater<(ProjectDetailsDTO & { assets: AssetDTO[] }) | null>
>({ v: null, update: () => {} });
export const ProjectProvider = ProjectContext.Provider;
export const useProject = () => useContext(ProjectContext).v;
export const useUpdateProject = () => useContext(ProjectContext).update;
