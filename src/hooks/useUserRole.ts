// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useStore } from "@/zustand/globalStoreProvider";
import { useCurrentUser } from "./useCurrentUser";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveProject } from "./useActiveProject";
import { useActiveAsset } from "./useActiveAsset";

export const useCurrentUserRole = () => {
  const currentUser = useCurrentUser();

  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  if (!currentUser) {
    return "";
  }

  if (project && project.members) {
    for (const member of project.members) {
      if (member.id === currentUser.id) {
        return member.role || "member";
      }
    }
  }
  if (activeOrg && activeOrg.members) {
    for (const member of activeOrg.members) {
      if (member.id === currentUser.id) {
        return member.role || "member";
      }
    }
  }

  return "member"; // Default role if not found
};
