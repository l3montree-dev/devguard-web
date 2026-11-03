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
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetScope } from "@/hooks/useAssetScope";
import { useAssetUpdate } from "@/hooks/useAssetUpdate";
import { toast } from "@/lib/toast";
import { deleteAsset } from "@/services/assetService";
import { classNames } from "@/utils/common";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AssetDangerZone = () => {
  const asset = useActiveAsset()!;
  const project = useActiveProject()!;
  const org = useActiveOrg();
  const scope = useAssetScope();
  const handleUpdate = useAssetUpdate();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteAsset(scope);
      toast("Repository deleted", {
        description: "The asset has been deleted",
      });
      router.push(`/${scope.organization}/projects/${scope.projectSlug}`);
    } catch {
      toast.error("Could not delete repository");
    }
  };

  return (
    <DangerZone>
      <div className="flex flex-col gap-4">
        <div className={classNames(!project.isPublic && "opacity-50")}>
          <ListItem
            Title={
              <span className="flex items-center">
                Public Project
                <Tooltip>
                  <TooltipTrigger aria-label="More information about public projects">
                    <InfoIcon className="ml-1.5 block h-4 w-4 text-primary" />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>
                        Non-members will be able to see the project pages but do
                        not have any write access to anything.
                      </p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </span>
            }
            Description={`Makes the ${asset.name} project visible to non-members of the ${org.name} organization.`}
            Button={
              <Switch
                data-testid="publish-repo-switch"
                disabled={!project.isPublic}
                checked={asset.isPublic}
                onCheckedChange={(isPublic) => handleUpdate({ isPublic })}
              />
            }
          />
        </div>
        {project.isPublic ? null : (
          <div className="flex items-center justify-between mb-2">
            <small>
              The group is not public. You can not make the repository public.
            </small>
            <Link
              href={`/${scope.organization}/projects/${scope.projectSlug}/settings/danger-zone`}

              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Go to Project Settings
            </Link>
          </div>
        )}
        {asset.externalEntityProviderId ? null : (
          <ListItem
            Title="Delete Repository"
            Description="This will delete the repository and all of its data. This action cannot be undone."
            Button={
              <Alert
                title="Are you sure to delete this repository?"
                description="This action cannot be undone. All data associated with this repository will be deleted."
                onConfirm={handleDelete}
              >
                <Button
                  variant="destructive"
                  data-testid="delete-repository-button"
                >
                  Delete
                </Button>
              </Alert>
            }
          />
        )}
      </div>
    </DangerZone>
  );
};

export default AssetDangerZone;
