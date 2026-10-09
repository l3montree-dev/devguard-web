// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Alert from "@/components/common/Alert";
import DangerZone from "@/components/common/DangerZone";
import ListItem from "@/components/common/ListItem";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrgUpdate } from "@/hooks/useOrgUpdate";
import { toast } from "@/lib/toast";
import { deleteOrganization } from "@/services/organizationService";
import { useState } from "react";

const OrgDangerZone = () => {
  const org = useActiveOrg();
  const handleUpdate = useOrgUpdate();
  const [isPublic, setIsPublic] = useState(org.isPublic);
  const [isSaving, setIsSaving] = useState(false);

  const handlePublicChange = async (checked: boolean) => {
    setIsPublic(checked);
    setIsSaving(true);
    if (!(await handleUpdate({ isPublic: checked }))) {
      setIsPublic(!checked);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    try {
      await deleteOrganization(org.slug);
      toast.success("Organization deleted successfully");
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a soft push keeps the deleted org in the client cache
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete organization");
    }
  };

  return (
    <DangerZone>
      <div className="flex flex-col gap-4">
        <ListItem
          Title="Public Organization"
          Description="Setting this to true will make the organization visible to the public. Only projects that are public become visible, private projects stay visible to members of the organization only."
          Button={
            <Switch
              data-testid="public-org-switch"
              disabled={isSaving}
              checked={isPublic}
              onCheckedChange={handlePublicChange}
            />
          }
        />
        <ListItem
          Title="Delete Organization"
          Description="This will delete the organization including all projects and repositories. This action cannot be undone."
          Button={
            <Alert
              title="Are you sure to delete this organization?"
              description="This action cannot be undone. All data associated with this organization will be deleted."
              onConfirm={handleDelete}
            >
              <Button variant="destructive">Delete</Button>
            </Alert>
          }
        />
      </div>
    </DangerZone>
  );
};

export default OrgDangerZone;
