// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AssetMemberDialog from "@/components/AssetMemberDialog";
import MembersTable from "@/components/MembersTable";
import { Button } from "@/components/ui/button";
import { useUpdateAsset } from "@/context/AssetContext";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetScope } from "@/hooks/useAssetScope";
import { toast } from "@/lib/toast";
import {
  changeAssetMemberRole,
  removeAssetMember,
} from "@/services/assetService";
import type { UserRole } from "@/types/view/vuln";
import { useState } from "react";

const MembersSettings = () => {
  const asset = useActiveAsset()!;
  const scope = useAssetScope();
  const updateAsset = useUpdateAsset();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRemoveMember = async (id: string) => {
    try {
      await removeAssetMember(scope, id);
      updateAsset({
        ...asset,
        members: asset.members.filter((member) => member.id !== id),
      });
      toast.success("Member deleted");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleChangeMemberRole = async (
    id: string,
    role: UserRole.Admin | UserRole.Member,
  ) => {
    try {
      await changeAssetMemberRole(scope, id, role);
      updateAsset({
        ...asset,
        members: asset.members.map((member) =>
          member.id === id ? { ...member, role } : member,
        ),
      });
      toast.success("Role successfully changed");
    } catch {
      toast.error("Failed to update member role");
    }
  };

  return (
    <>
      <MembersTable
        members={asset.members}
        onRemoveMember={handleRemoveMember}
        onChangeMemberRole={handleChangeMemberRole}
      />
      <AssetMemberDialog isOpen={dialogOpen} onOpenChange={setDialogOpen} />
      <div className="flex flex-row justify-end">
        <Button type="button" onClick={() => setDialogOpen(true)}>
          Add Member
        </Button>
      </div>
    </>
  );
};

export default MembersSettings;
