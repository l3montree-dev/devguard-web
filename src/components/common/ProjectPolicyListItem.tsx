import React, { useState } from "react";
import { Policy, UserRole } from "../../types/api/api";
import ListItem from "./ListItem";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import PolicyDialog from "../PolicyDialog";
import { useCurrentUserRole } from "../../hooks/useUserRole";

export const PolicyListItem = ({
  policy,
  onEnablePolicy,
  onDisablePolicy,
}: {
  policy: Policy & { enabled: boolean };
  onEnablePolicy: (policy: Policy) => Promise<void>;
  onDisablePolicy: (policy: Policy) => Promise<void>;
}) => {
  const currentUserRole = useCurrentUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const handlePolicyToggle = async (enabled: boolean) => {
    if (enabled) {
      await onEnablePolicy(policy);
    } else {
      await onDisablePolicy(policy);
    }
  };

  return (
    <React.Fragment key={policy.id}>
      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        <ListItem
          reactOnHover
          key={policy.id}
          Button={
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={policy.enabled}
                onCheckedChange={handlePolicyToggle}
                disabled={
                  currentUserRole !== UserRole.Admin &&
                  currentUserRole !== UserRole.Owner
                }
              />
            </div>
          }
          Title={
            <span className="flex flex-row items-center gap-2">
              {policy.title}
              {policy.organizationId === null && (
                <Badge variant="secondary">Community Managed</Badge>
              )}
            </span>
          }
          Description={policy.description}
        />
      </div>
      <PolicyDialog
        isOpen={isOpen}
        title={policy.title}
        description={policy.description}
        buttonTitle="Update Policy"
        onOpenChange={setIsOpen}
        policy={policy}
      />
    </React.Fragment>
  );
};
