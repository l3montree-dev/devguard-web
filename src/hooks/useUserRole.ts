// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveProject } from "./useActiveProject";
import { UserRole } from "@/types/api/api";

export const useCurrentUserRole = () => {
  const currentUser = useCurrentUser();
  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  return useMemo(() => {
    if (!currentUser) {
      return "";
    }

    if (project?.members) {
      const projectMember = project.members.find(
        (member) => member.id === currentUser.id,
      );
      if (projectMember) {
        return projectMember.role || UserRole.Member;
      }
    }

    if (activeOrg?.members) {
      const orgMember = activeOrg.members.find(
        (member) => member.id === currentUser.id,
      );
      if (orgMember) {
        return orgMember.role || UserRole.Member;
      }
    }

    return UserRole.Member; // Default role if not found
  }, [currentUser, project?.members, activeOrg?.members]);
};
