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
import { createAssetVersion } from "@/services/assetVersionService";
import { toast } from "@/lib/toast";
import { useUpdateAsset } from "../context/AssetContext";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveProject } from "../hooks/useActiveProject";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isTag: boolean;
}

const CreateRefDialog: FunctionComponent<Props> = ({
  isOpen,
  onOpenChange,
  isTag,
}) => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject()!;
  const activeAsset = useActiveAsset()!;
  const updateAsset = useUpdateAsset();
  const [branchOrTagName, setBranchOrTagName] = useState("");

  const handleCreateRef = async () => {
    let created;
    try {
      created = await createAssetVersion(
        {
          organization: activeOrg.slug,
          projectSlug: activeProject.slug,
          assetSlug: activeAsset.slug,
        },
        { name: branchOrTagName, tag: isTag } as never,
      );
    } catch {
      created = null;
    }

    if (created) {
      const newRef = created;
      toast.success(`${isTag ? "Tag" : "Branch"} created successfully`);
      updateAsset((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          refs: [...prev.refs, newRef],
        };
      });
      setBranchOrTagName("");
      onOpenChange(false);
    } else {
      toast.error(`Failed to create ${isTag ? "tag" : "branch"}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new {isTag ? "Tag" : "Branch"}</DialogTitle>
          <DialogDescription>
            This is pretty much the same as git branches and tags, but scoped to
            this asset. Each reference can hold multiple Artifacts. You can
            create branches to manage different lines of development, and tags
            to mark specific points in your asset&#39;s history.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full border-t pt-4 flex-row gap-2">
          <div className="w-full">
            <Label className="mb-2 block">
              {isTag ? "Tag" : "Branch"} Name
            </Label>
            <Input
              value={branchOrTagName}
              onChange={(e) => setBranchOrTagName(e.target.value)}
              placeholder={isTag ? "Enter tag name" : "Enter branch name"}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <div className="flex flex-col items-end justify-end gap-2">
            <Button onClick={handleCreateRef} type="submit">
              Create {isTag ? "Tag" : "Branch"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRefDialog;
