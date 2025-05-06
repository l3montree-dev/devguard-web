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
import { toast } from "sonner";
import { useActiveProject } from "../hooks/useActiveProject";
import Callout from "./common/Callout";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { useStore } from "../zustand/globalStoreProvider";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectMemberDialog: FunctionComponent<Props> = ({
  isOpen,
  onOpenChange,
}) => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const updateProject = useStore((s) => s.updateProject);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleInviteSelectedMembers = async () => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        activeProject.slug +
        "/members",
      {
        method: "POST",
        body: JSON.stringify({
          ids: selectedMembers,
        }),
      },
    );

    if (!resp.ok) {
      toast.error("Failed to invite member");
      return;
    } else {
      updateProject({
        ...activeProject,
        members: activeProject.members.concat(
          activeOrg.members
            .filter((e) => selectedMembers.includes(e.id))
            .map((e) => ({
              ...e,
              role: "member",
            })),
        ),
      });
      toast.success("Members successfully added to the project");
      onOpenChange(false);
    }
  };

  const membersToInvite = useMemo(() => {
    const projectMemberIds = activeProject.members.reduce(
      (acc, m) => {
        acc[m.id] = true;
        return acc;
      },
      {} as { [key: string]: boolean },
    );
    return activeOrg?.members.filter((m) => !projectMemberIds[m.id]);
  }, [activeProject?.members, activeOrg?.members]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Invite a new member to your organization by entering their email
            address.
          </DialogDescription>
        </DialogHeader>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            )}
          >
            Select the people you would like to invite to the project. (
            {selectedMembers.length} currently selected)
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            {membersToInvite?.map((m) => (
              <DropdownMenuCheckboxItem
                onClick={() =>
                  setSelectedMembers((prev) => {
                    if (prev.includes(m.id)) {
                      return prev.filter((el) => el !== m.id);
                    }
                    return prev.concat(m.id);
                  })
                }
                checked={selectedMembers.includes(m.id)}
                key={m.id}
              >
                {m.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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

export default ProjectMemberDialog;
