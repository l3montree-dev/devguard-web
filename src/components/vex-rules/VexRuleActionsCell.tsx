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
import { browserApiClient } from "@/services/devGuardApi";

interface VexRuleActionsCellProps {
  deleteUrl: string;
  onEdit: () => void;
  onDeleted: () => void;
}

const VexRuleActionsCell: FunctionComponent<VexRuleActionsCellProps> = ({
  deleteUrl,
  onEdit,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await browserApiClient(deleteUrl, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete VEX rule");
      }

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
