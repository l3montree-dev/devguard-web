// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useState } from "react";
import type { FunctionComponent } from "react";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Alert from "@/components/common/Alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/lib/toast";
import { deleteVexRule } from "@/services/vexRuleService";
import type { AssetScope } from "@/services/vexRuleService";

interface VexRuleActionsCellProps {
  scope: AssetScope;
  ruleId: string;
  onEdit: () => void;
  onDeleted: () => void;
}

const VexRuleActionsCell: FunctionComponent<VexRuleActionsCellProps> = ({
  scope,
  ruleId,
  onEdit,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteVexRule(scope, ruleId);
      toast.success("VEX rule deleted");
      onDeleted();
    } catch (error) {
      toast.error("Failed to delete VEX rule");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isDeleting}>
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <Alert
          onConfirm={handleDelete}
          title="Delete VEX rule"
          description="Vulnerabilities this rule handles will reopen. This cannot be undone."
        >
          {/* Keeping the menu open on select lets the confirmation take over —
              a closing menu would unmount its own trigger. */}
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            disabled={isDeleting}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </Alert>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VexRuleActionsCell;
