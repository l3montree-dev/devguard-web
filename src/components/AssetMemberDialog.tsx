// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useMemo, useState } from "react";
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
import { inviteAssetMembers } from "@/services/assetService";
import { UserRole } from "@/types/view/vuln";
import { toast } from "@/lib/toast";
import { useUpdateAsset } from "../context/AssetContext";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { Button } from "./ui/button";

import { useActiveProject } from "../hooks/useActiveProject";
import { MultiselectCombobox } from "./common/MultiselectCombobox";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AssetMemberDialog: FunctionComponent<Props> = ({
  isOpen,
  onOpenChange,
}) => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject()!;
  const activeAsset = useActiveAsset()!;
  const updateAsset = useUpdateAsset();
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
      await inviteAssetMembers(
        {
          organization: activeOrg.slug,
          projectSlug: activeProject.slug,
          assetSlug: activeAsset.slug,
        },
        ids,
      );
    } catch {
      ok = false;
    }

    if (!ok) {
      toast.error("Failed to invite member");
      return;
    } else {
      updateAsset({
        ...activeAsset,
        members: activeAsset.members.concat(
          activeProject.members
            .filter((e) => ids.includes(e.id))
            .map((e) => ({
              ...e,
              avatarUrl: e.avatarUrl ?? "",
              role: UserRole.Member,
            })),
        ),
      });
      toast.success("Members successfully added to the project");
      onOpenChange(false);
    }
  };

  const membersToInvite = useMemo(() => {
    const assetMemberIds = activeAsset.members.reduce(
      (acc, m) => {
        acc[m.id] = true;
        return acc;
      },
      {} as { [key: string]: boolean },
    );
    return activeProject.members.filter((m) => !assetMemberIds[m.id]);
  }, [activeAsset.members, activeProject.members]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Invite someone to collaborate on this repository{" "}
            <span className="font-semibold text-foreground">
              {activeAsset.name}
            </span>
            . Make sure they are already a member of the project{" "}
            <span className="font-semibold text-foreground">
              {activeProject.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <MultiselectCombobox
          placeholder="Search organization members..."
          items={membersToInvite.map((r) => ({
            label: r.name,
            value: r.id,
          }))}
          loading={false}
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

export default AssetMemberDialog;
