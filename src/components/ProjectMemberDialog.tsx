// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useState } from "react";
import type { FunctionComponent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useApiQuery } from "@/hooks/useApiQuery";
import { inviteProjectMembers } from "@/services/projectService";
import { UserRole } from "@/types/view/vuln";
import { toast } from "@/lib/toast";
import { useUpdateProject } from "../context/ProjectContext";
import { useActiveProject } from "../hooks/useActiveProject";
import { MultiselectCombobox } from "./common/MultiselectCombobox";
import { Button } from "./ui/button";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectMemberDialog: FunctionComponent<Props> = ({
  isOpen,
  onOpenChange,
}) => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject()!;
  const updateProject = useUpdateProject();
  const [selectedMembers, setSelectedMembers] = useState<
    Array<{
      value: string;
      label: string;
    }>
  >([]);

  const handleInviteSelectedMembers = async () => {
    const ids = selectedMembers.map((m) => m.value);
    let ok = true;
    try {
      await inviteProjectMembers(
        { organization: activeOrg.slug, projectSlug: activeProject.slug },
        ids,
      );
    } catch {
      ok = false;
    }

    if (!ok) {
      toast.error("Failed to invite member");
      return;
    } else {
      updateProject({
        ...activeProject,
        members: activeProject.members.concat(
          activeOrg.members
            .filter((e) => ids.includes(e.id))
            .map((e) => ({
              ...e,
              role: UserRole.Member,
            })),
        ),
      });
      toast.success("Members successfully added to the project");
      onOpenChange(false);
    }
  };

  const parentSlug = activeProject.parentId
    ? activeProject.parent?.slug
    : undefined;

  const { data: parentMembers, isLoading: loadingMembers } = useApiQuery(
    parentSlug
      ? "/organizations/{organization}/projects/{projectSlug}/members"
      : null,
    {
      params: {
        path: { organization: activeOrg.slug, projectSlug: parentSlug ?? "" },
      },
    },
  );

  const projectMemberIds = new Set(activeProject.members.map((m) => m.id));

  const memberPool: Array<{ id: string; name: string }> = parentSlug
    ? (parentMembers ?? []).map((m) => ({ id: m.id ?? "", name: m.name ?? "" }))
    : activeOrg.members;

  const membersToInvite = memberPool.filter((m) => !projectMemberIds.has(m.id));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Invite someone to participate in the project{" "}
            <span className="font-semibold text-foreground">
              {activeProject.name}
            </span>
            .{" "}
            {activeProject.parentId ? (
              <>
                Make sure they are already a member of the parent project{" "}
                <span className="font-semibold text-foreground">
                  {activeProject.parent?.name}
                </span>
                . Otherwise they need to be invited to{" "}
                <span className="font-semibold text-foreground">
                  {activeProject.parent?.name}
                </span>{" "}
                first.
              </>
            ) : (
              <>
                Make sure they are part of the organization{" "}
                <span className="font-semibold text-foreground">
                  {activeOrg.name}
                </span>{" "}
                already. Otherwise they need to be invited to the organization
                first.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <MultiselectCombobox
          placeholder="Search organization members..."
          items={membersToInvite.map((r) => ({
            label: r.name,
            value: r.id,
          }))}
          loading={loadingMembers}
          onRemove={(item) => {
            setSelectedMembers((prev) =>
              prev.filter((el) => el.value !== item.value),
            );
          }}
          onSelect={(item) => {
            setSelectedMembers((prev) => {
              const index = prev.findIndex((el) => el.value === item.value);
              if (index !== -1) {
                // remove item
                return prev.filter((el) => el.value !== item.value);
              }
              return prev.concat(item);
            });
          }}
          values={selectedMembers}
          emptyMessage="No members found"
        />
        <DialogFooter className="mt-2">
          <div className="flex flex-col items-end justify-end gap-2">
            <Button onClick={handleInviteSelectedMembers} type="submit">
              Invite
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectMemberDialog;
