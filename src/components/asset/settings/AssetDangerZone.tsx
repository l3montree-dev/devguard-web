// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Alert from "@/components/common/Alert";
import DangerZone from "@/components/common/DangerZone";
import ListItem from "@/components/common/ListItem";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetScope } from "@/hooks/useAssetScope";
import { useAssetUpdate } from "@/hooks/useAssetUpdate";
import { toast } from "@/lib/toast";
import { deleteAsset } from "@/services/assetService";
import { classNames } from "@/utils/common";
import { useRouter } from "next/navigation";

const AssetDangerZone = () => {
  const asset = useActiveAsset()!;
  const project = useActiveProject()!;
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
            Title="Public Repository"
            Description="Setting this to true will make the repository visible to the public."
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
          <small>
            The group is not public. You can not make the repository public.
          </small>
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
