// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Alert from "@/components/common/Alert";
import DangerZone from "@/components/common/DangerZone";
import ListItem from "@/components/common/ListItem";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useProjectResources } from "@/hooks/useProjectResources";
import { useProjectScope } from "@/hooks/useProjectScope";
import { useProjectUpdate } from "@/hooks/useProjectUpdate";
import { toast } from "@/lib/toast";
import { deleteProject } from "@/services/projectService";
import { classNames } from "@/utils/common";

import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const publicFilter = new URLSearchParams({
  "filterQuery[is_public][is]": "true",
  pageSize: "1",
});

const ProjectDangerZone = () => {
  const org = useActiveOrg();
  const project = useActiveProject()!;
  const scope = useProjectScope();
  const handleUpdate = useProjectUpdate();
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(project.isPublic);
  const [isSaving, setIsSaving] = useState(false);
  const isSubGroup = !!project.parentId;
  const canBePublic = isSubGroup ? !!project.parent?.isPublic : org.isPublic;
  const { data: publicChildren } = useProjectResources(
    scope.organization,
    scope.projectSlug,
    project.id,
    publicFilter,
    false,
  );
  const publicChild = isPublic ? publicChildren?.data[0] : undefined;

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
        <div
          className={classNames((!canBePublic || publicChild) && "opacity-50")}
        >
          <ListItem
            Title={
              <span className="flex items-center">
                {isSubGroup ? "Public Sub-Group" : "Public Group"}
                <Tooltip>
                  <TooltipTrigger aria-label="More information about public groups">
                    <InfoIcon className="ml-1.5 block h-4 w-4 text-primary" />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>
                        Only sub-groups and projects that are set to public
                        become visible, private projects stay visible to members
                        of the organization only. All sub-groups and projects
                        are still private by default.
                      </p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </span>
            }
            Description={`Makes the ${project.name} ${isSubGroup ? "sub-group" : "group"} visible to non-members of the ${org.name} organization. Has to be enabled so individual sub-groups and projects can be set to public.`}
            Button={
              <Switch
                data-testid="public-group-switch"
                disabled={!canBePublic || !!publicChild || isSaving}
                checked={isPublic}
                onCheckedChange={handlePublicChange}
              />
            }
          />
        </div>
        {canBePublic ? null : (
          <div className="flex items-center justify-between mb-2">
            <small>
              {isSubGroup
                ? `The parent group ${project.parent?.name} is not public. You can not make the sub-group public.`
                : "The organization is not public. You can not make the group public."}
            </small>
            <Link
              href={
                isSubGroup
                  ? `/${scope.organization}/projects/${project.parent?.slug}/settings/danger-zone`
                  : `/${scope.organization}/settings/danger-zone`
              }
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              {isSubGroup
                ? "Go to Parent Group Settings"
                : "Go to Organization Settings"}
            </Link>
          </div>
        )}
        {publicChild && (
          <div className="flex items-center justify-between mb-2">
            <small>
              The{" "}
              {publicChild.resourceType === "asset"
                ? "repository"
                : "sub-group"}{" "}
              {publicChild.name} is still public. Make it private before making
              this {isSubGroup ? "sub-group" : "group"} private.
            </small>
            <Link
              href={
                publicChild.resourceType === "asset"
                  ? `/${scope.organization}/projects/${scope.projectSlug}/assets/${publicChild.slug}/settings/danger-zone`
                  : `/${scope.organization}/projects/${publicChild.slug}/settings/danger-zone`
              }
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              {publicChild.resourceType === "asset"
                ? "Go to Repository Settings"
                : "Go to Sub-Group Settings"}
            </Link>
          </div>
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
