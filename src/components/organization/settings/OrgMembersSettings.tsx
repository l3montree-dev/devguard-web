// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Section from "@/components/common/Section";
import InvitedMembersTable from "@/components/InvitedMembersTable";
import MemberDialog from "@/components/MemberDialog";
import MembersTable from "@/components/MembersTable";
import { Button } from "@/components/ui/button";
import { usePatchOrgContext } from "@/hooks/usePatchOrgContext";
import { toast } from "@/lib/toast";
import {
  changeOrgMemberRole,
  removeOrgMember,
  revokeInvitation,
} from "@/services/organizationService";
import type { UserRole } from "@/types/view/vuln";
import { useState } from "react";

const OrgMembersSettings = () => {
  const [org, patchOrg] = usePatchOrgContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChangeMemberRole = async (
    id: string,
    role: UserRole.Admin | UserRole.Member,
  ) => {
    try {
      await changeOrgMemberRole(org.slug, id, role);
      patchOrg({
        members: org.members.map((m) => (m.id === id ? { ...m, role } : m)),
      });
    } catch {
      toast.error("Failed to update member role");
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeOrgMember(org.slug, id);
      patchOrg({ members: org.members.filter((m) => m.id !== id) });
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      await revokeInvitation(org.slug, id);
      patchOrg({
        invitedMembers: org.invitedMembers.filter((m) => m.id !== id),
      });
    } catch {
      toast.error("Failed to revoke invitation");
    }
  };

  return (
    <>
      <Section
        forceVertical
        primaryHeadline
        title="Members"
        description="Manage the members of your organization"
      >
        <MembersTable
          members={org.members}
          onChangeMemberRole={handleChangeMemberRole}
          onRemoveMember={handleRemoveMember}
        />
        <MemberDialog isOpen={dialogOpen} onOpenChange={setDialogOpen} />
        <div className="flex flex-row justify-end">
          <Button
            data-testid="add-member-button"
            onClick={() => setDialogOpen(true)}
          >
            Add Member
          </Button>
        </div>
      </Section>
      <Section
        forceVertical
        title="Invitations"
        description="Manage pending invitations of your organization"
      >
        <InvitedMembersTable
          members={org.invitedMembers}
          onRevokeInvitation={handleRevokeInvitation}
        />
      </Section>
    </>
  );
};

export default OrgMembersSettings;
