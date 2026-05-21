// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { UserRole } from "@/types/api/api";
import type { OrganizationDetailsDTO, ProjectDTO } from "@/types/api/api";
import type { User } from "@/types/auth";
import { useMemo } from "react";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveProject } from "./useActiveProject";
import { useCurrentUser } from "./useCurrentUser";
import useDecodedParams from "./useDecodedParams";
import { useActiveAsset } from "./useActiveAsset";

export const useCurrentUserRole = () => {
  const currentUser = useCurrentUser();
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  const { projectSlug } = useDecodedParams() as {
    projectSlug: string;
  }; // projectSlug from URL params

  return useMemo(() => {
    return getCurrentUserRole(
      currentUser,
      activeOrg as OrganizationDetailsDTO,
      projectSlug, // projectSlug from URL params
      project,
      asset,
    );
  }, [currentUser, project, activeOrg, projectSlug]);
};

export const isLoggedIn = (role: UserRole | null): boolean => role !== null;

const ROLE_RANK: Record<string, number> = {
  [UserRole.Guest]: 0,
  [UserRole.Member]: 1,
  [UserRole.Admin]: 2,
  [UserRole.Owner]: 3,
};

export const isAtLeast = (
  role: UserRole | null,
  minimum: UserRole,
): boolean => {
  if (role === null) return false;
  const roleRank = ROLE_RANK[role];
  const minimumRank = ROLE_RANK[minimum];
  if (roleRank === undefined || minimumRank === undefined) return false;
  return roleRank >= minimumRank;
};

export const isMember = (role: UserRole | null) =>
  isAtLeast(role, UserRole.Member);
export const isAdmin = (role: UserRole | null) =>
  isAtLeast(role, UserRole.Admin);

export const getCurrentUserRole = (
  currentUser: User | undefined,
  org: OrganizationDetailsDTO,
  projectSlug?: string | undefined,
  project?: ProjectDTO | null,
  asset?: ReturnType<typeof useActiveAsset> | null,
): UserRole | null => {
  if (!currentUser) {
    return null;
  }

  if (asset?.members) {
    const assetMember = asset.members.find(
      (member) => member.id === currentUser.id,
    );
    if (assetMember) {
      return assetMember.role || UserRole.Member;
    }
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

  return UserRole.Guest; // Default role if not found
};
