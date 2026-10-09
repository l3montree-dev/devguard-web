// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Alert from "@/components/common/Alert";
import DangerZone from "@/components/common/DangerZone";
import ListItem from "@/components/common/ListItem";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useProjectScope } from "@/hooks/useProjectScope";
import { useProjectUpdate } from "@/hooks/useProjectUpdate";
import { toast } from "@/lib/toast";
import { deleteProject } from "@/services/projectService";
import { classNames } from "@/utils/common";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ProjectDangerZone = () => {
  const org = useActiveOrg();
  const project = useActiveProject()!;
  const scope = useProjectScope();
  const handleUpdate = useProjectUpdate();
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(project.isPublic);
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
      await deleteProject(scope);
      toast("Group deleted", { description: "The group has been deleted" });
      router.push(`/${scope.organization}`);
    } catch {
      toast.error("Could not delete group");
    }
  };

  return (
    <DangerZone>
      <div className="flex flex-col gap-4">
        <div className={classNames(!org.isPublic && "opacity-50")}>
          <ListItem
            Title="Public Group"
            Description="Setting this to true will make the group visible to the public. It allows creating public and private assets."
            Button={
              <Switch
                data-testid="public-group-switch"
                disabled={!org.isPublic || isSaving}
                checked={isPublic}
                onCheckedChange={handlePublicChange}
              />
            }
          />
        </div>
        {org.isPublic ? null : (
          <small>
            The organization is not public. You can not make the group public.
          </small>
        )}
        {project.externalEntityProviderId ? null : (
          <ListItem
            Title="Delete Group"
            Description="This will delete the group and all of its data. This action cannot be undone."
            Button={
              <Alert
                title="Are you sure to delete this group?"
                description="This action cannot be undone. All data associated with this group will be deleted."
                onConfirm={handleDelete}
              >
                <Button variant="destructive">Delete</Button>
              </Alert>
            }
          />
        )}
      </div>
    </DangerZone>
  );
};

export default ProjectDangerZone;
