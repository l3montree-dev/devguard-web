import React, { useState } from "react";
import { Policy } from "../../types/api/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ListItem from "./ListItem";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import PolicyDialog from "../PolicyDialog";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";

export const PolicyListItem = ({
  policy,
  onPolicyUpdate,
  onPolicyDelete,
}: {
  policy: Policy;
  onPolicyUpdate: (policy: Policy) => Promise<void>;
  onPolicyDelete: (policy: Policy) => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handlePolicyUpdate = async (newPolicy: Policy) => {
    await onPolicyUpdate({ ...newPolicy, id: policy.id });
    setIsOpen(false);
  };
  return (
    <React.Fragment key={policy.id}>
      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        <ListItem
          key={policy.id}
          Button={
            policy.organizationId !== null && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon",
                  })}
                >
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpen(true);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPolicyDelete(policy)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
          Title={
            <span className="flex flex-row items-center gap-2">
              {policy.title}
              {policy.organizationId === null && (
                <Badge variant={"secondary"}>Community Managed</Badge>
              )}
            </span>
          }
          Description={policy.description}
        />
      </div>
      <PolicyDialog
        isOpen={isOpen}
        title="Edit Policy"
        description="Edit the policy for your organization."
        buttonTitle="Update Policy"
        onOpenChange={setIsOpen}
        onSubmit={
          policy.organizationId !== null ? handlePolicyUpdate : undefined
        }
        policy={policy}
      />
    </React.Fragment>
  );
};
export default PolicyListItem;
