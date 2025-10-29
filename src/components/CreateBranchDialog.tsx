import { FunctionComponent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "sonner";
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
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        activeProject.slug +
        "/assets/" +
        activeAsset.slug +
        "/refs",
      {
        method: "POST",
        body: JSON.stringify({
          name: branchOrTagName,
          tag: isTag,
        }),
      },
    );

    if (resp.ok) {
      const newRef = await resp.json();
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
