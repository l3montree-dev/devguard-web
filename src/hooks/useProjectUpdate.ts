// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useRouter } from "next/navigation";
import { useUpdateProject } from "@/context/ProjectContext";
import { toast } from "@/lib/toast";
import { patchProject } from "@/services/projectService";
import type { ProjectDTO } from "@/types/dto";
import { useActiveProject } from "./useActiveProject";
import { useProjectScope } from "./useProjectScope";

export const useProjectUpdate = () => {
  const project = useActiveProject()!;
  const scope = useProjectScope();
  const updateProject = useUpdateProject();
  const router = useRouter();

  return async (data: Partial<ProjectDTO>) => {
    let updated: ProjectDTO;
    try {
      updated = (await patchProject(scope, data)) as ProjectDTO;
    } catch {
      toast.error("Could not update group");
      return false;
    }

    toast("Success", { description: "Group updated" });
    updateProject(updated as typeof project);
    if (updated.slug !== project.slug) {
      router.push(`/${scope.organization}/projects/${updated.slug}/settings`);
    }
    return true;
  };
};
