// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { OrganizationDetailsDTO, ProjectDTO, UserRole } from "@/types/api/api";
import { User } from "@/types/auth";
import { useMemo } from "react";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveProject } from "./useActiveProject";
import { useCurrentUser } from "./useCurrentUser";
import { useParams } from "next/navigation";

export const useCurrentUserRole = () => {
  const currentUser = useCurrentUser();
  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const { projectSlug } = useParams<{
    projectSlug: string;
  }>();

  return useMemo(() => {
    return getCurrentUserRole(
      currentUser,
      activeOrg as OrganizationDetailsDTO,
      projectSlug, // projectSlug from URL params
      project,
    );
  }, [currentUser, project, activeOrg, projectSlug]);
};

export const getCurrentUserRole = (
  currentUser: User | undefined,
  org: OrganizationDetailsDTO,
  projectSlug?: string | undefined,
  project?: ProjectDTO,
): UserRole | null => {
  if (!currentUser) {
    throw new Error(
      "User is not even logged in and you are trying to get their role",
    );
  }

  if (project?.members && projectSlug) {
    const projectMember = project.members.find(
      (member) => member.id === currentUser.id,
    );
    if (projectMember) {
      return projectMember.role || UserRole.Member;
    }
  }

  if (org?.members) {
    const orgMember = org.members.find(
      (member) => member.id === currentUser.id,
    );
    if (orgMember) {
      return orgMember.role || UserRole.Member;
    }
  }

  return UserRole.Member; // Default role if not found
};
