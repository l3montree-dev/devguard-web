// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

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
