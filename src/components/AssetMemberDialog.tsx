import { FunctionComponent, useMemo, useState } from "react";
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
import { UserRole } from "@/types/api/api";
import { toast } from "sonner";
import { useUpdateAsset } from "../context/AssetContext";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useActiveProject } from "../hooks/useActiveProject";
import { MultiselectCombobox } from "./common/MultiselectCombobox";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AssetMemberDialog: FunctionComponent<Props> = ({
  isOpen,
  onOpenChange,
}) => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject()!;
  const activeAsset = useActiveAsset()!;
  const updateAsset = useUpdateAsset();
  const [selectedMembers, setSelectedMembers] = useState<
    Array<{
      value: string;
      label: string;
    }>
  >([]);

  const handleInviteSelectedMembers = async () => {
    const ids = selectedMembers.map((m) => m.value);
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        activeProject.slug +
        "/assets/" +
        activeAsset.slug +
        "/members",
      {
        method: "POST",
        body: JSON.stringify({
          ids,
        }),
      },
    );

    if (!resp.ok) {
      toast.error("Failed to invite member");
      return;
    } else {
      updateAsset({
        ...activeAsset,
        members: activeAsset.members.concat(
          activeProject.members
            .filter((e) => ids.includes(e.id))
            .map((e) => ({
              ...e,
              role: UserRole.Member,
            })),
        ),
      });
      toast.success("Members successfully added to the project");
      onOpenChange(false);
    }
  };

  const membersToInvite = useMemo(() => {
    const assetMemberIds = activeAsset.members.reduce(
      (acc, m) => {
        acc[m.id] = true;
        return acc;
      },
      {} as { [key: string]: boolean },
    );
    return activeProject.members.filter((m) => !assetMemberIds[m.id]);
  }, [activeAsset.members, activeProject.members]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Invite a new member to the asset by entering their email address.
          </DialogDescription>
        </DialogHeader>
        <MultiselectCombobox
          placeholder="Search organization members..."
          items={membersToInvite.map((r) => ({
            label: r.name,
            value: r.id,
          }))}
          loading={false}
          onRemove={(item) => {
            setSelectedMembers((prev) =>
              prev.filter((el) => el.value !== item.value),
            );
          }}
          onSelect={(item) => {
            setSelectedMembers((prev) => {
              const index = prev.findIndex((el) => el.value === item.value);
              if (index !== -1) {
                // remove item
                return prev.filter((el) => el.value !== item.value);
              }
              return prev.concat(item);
            });
          }}
          values={selectedMembers}
          emptyMessage="No repositories found"
        />
        <DialogFooter className="mt-2">
          <div className="flex flex-col items-end justify-end gap-2">
            <Button onClick={handleInviteSelectedMembers} type="submit">
              Invite
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssetMemberDialog;
