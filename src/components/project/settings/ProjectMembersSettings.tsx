// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import MembersTable from "@/components/MembersTable";
import ProjectMemberDialog from "@/components/ProjectMemberDialog";
import { Button } from "@/components/ui/button";
import { useUpdateProject } from "@/context/ProjectContext";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useProjectScope } from "@/hooks/useProjectScope";
import { toast } from "@/lib/toast";
import {
  changeProjectMemberRole,
  removeProjectMember,
} from "@/services/projectService";
import type { UserRole } from "@/types/view/vuln";
import { useState } from "react";

const ProjectMembersSettings = () => {
  const project = useActiveProject()!;
  const scope = useProjectScope();
  const updateProject = useUpdateProject();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChangeMemberRole = async (
    id: string,
    role: UserRole.Admin | UserRole.Member,
  ) => {
    try {
      await changeProjectMemberRole(scope, id, role);
      updateProject({
        ...project,
        members: project.members.map((m) => (m.id === id ? { ...m, role } : m)),
      });
      toast.success("Role successfully changed");
    } catch {
      toast.error("Failed to update member role");
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeProjectMember(scope, id);
      updateProject({
        ...project,
        members: project.members.filter((m) => m.id !== id),
      });
      toast.success("Member deleted");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <>
      <MembersTable
        members={project.members}
        onChangeMemberRole={handleChangeMemberRole}
        onRemoveMember={handleRemoveMember}
      />
      <ProjectMemberDialog isOpen={dialogOpen} onOpenChange={setDialogOpen} />
      <div className="flex flex-row justify-end">
        <Button onClick={() => setDialogOpen(true)}>Add Member</Button>
      </div>
    </>
  );
};

export default ProjectMembersSettings;
