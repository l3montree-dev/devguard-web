import type { VexRule } from "@/types/api/api";
import { useState } from "react";
import type { FunctionComponent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VexRuleResult from "./VexRuleResult";
import VexHasEffectBadge from "./VexHasEffectBadge";
import { Loader2, Trash2 } from "lucide-react";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "@/lib/toast";

interface VexRuleDetailsDialogProps {
  vexRule: VexRule | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  urlBase?: string;
  onDeleted?: () => void;
}

const VexRuleDetailsDialog: FunctionComponent<VexRuleDetailsDialogProps> = ({
  vexRule,
  isOpen,
  onOpenChange,
  urlBase,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!vexRule) return null;

  const handleDelete = async () => {
    if (!urlBase) return;

    setIsDeleting(true);
    try {
      await browserApiClient(`${urlBase}/${vexRule.id}`, {
        method: "DELETE",
      });
      toast.success("VEX rule deleted successfully");
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast.error("Failed to delete VEX rule");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>VEX Rule Details</DialogTitle>
          <DialogDescription>
            View the details of this VEX rule
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Title</span>
            <div className="mt-1 bg-card/50 p-2 rounded-md border whitespace-pre-wrap break-words text-xs font-mono">
              {vexRule.title}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground">CEL expression</span>
            <div className="mt-1 bg-card/50 p-2 rounded-md border whitespace-pre-wrap break-words text-xs font-mono">
              {vexRule.celExpression}
            </div>
          </div>

          {vexRule.justification && (
            <div>
              <span className="text-muted-foreground">Justification</span>
              <div className="mt-1 bg-card/50 p-2 rounded-md border whitespace-pre-wrap break-words text-xs">
                {vexRule.justification}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Rule Result</span>
            <VexRuleResult
              eventType={vexRule.eventType}
              mechanicalJustification={vexRule.mechanicalJustification}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Has Effect</span>
            <VexHasEffectBadge
              effectCount={vexRule.appliesToAmountOfDependencyVulns}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {urlBase && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Rule
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VexRuleDetailsDialog;
