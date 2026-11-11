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
import { useOrgProjects } from "@/hooks/useOrgProjects";
import { useOrgUpdate } from "@/hooks/useOrgUpdate";
import { toast } from "@/lib/toast";
import { deleteOrganization } from "@/services/organizationService";
import { classNames } from "@/utils/common";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const publicFilter = new URLSearchParams({
  "filterQuery[is_public][is]": "true",
  pageSize: "1",
});

const OrgDangerZone = () => {
  const org = useActiveOrg();
  const handleUpdate = useOrgUpdate();
  const [isPublic, setIsPublic] = useState(org.isPublic);
  const [isSaving, setIsSaving] = useState(false);
  const { data: publicProjects } = useOrgProjects(
    org.slug,
    publicFilter,
    false,
  );
  const publicProject = isPublic ? publicProjects?.data[0] : undefined;

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
        <div className={classNames(publicProject && "opacity-50")}>
          <ListItem
            Title={
              <span className="flex items-center">
                Public Organization
                <Tooltip>
                  <TooltipTrigger aria-label="More information about public organizations">
                    <InfoIcon className="ml-1.5 block h-4 w-4 text-primary" />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>
                        Only groups and projects that are set to public become
                        visible, private projects stay visible to members of the
                        organization only. All groups and projects are still
                        private by default.
                      </p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </span>
            }
            Description={`Makes the ${org.name} organization visible to non-members. Has to be enabled so individual groups and projects can be
                      set to public.`}
            Button={
              <Switch
                data-testid="public-org-switch"
                disabled={!!publicProject || isSaving}
                checked={isPublic}
                onCheckedChange={handlePublicChange}
              />
            }
          />
        </div>
        {publicProject && (
          <div className="flex items-center justify-between mb-2">
            <small>
              The group {publicProject.name} is still public. Make it private
              before making the organization private.
            </small>
            <Link
              href={`/${org.slug}/projects/${publicProject.slug}/settings/danger-zone`}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Go to Group Settings
            </Link>
          </div>
        )}
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
