// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Alert from "@/components/common/Alert";
import { checkCelSyntax } from "@/components/common/celLinter";
import { AsyncButton, Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldDescription } from "@/components/ui/field";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type { CreateVexRuleRequest, VexRule } from "@/types/api/api";
import { CircleAlert } from "lucide-react";
import { useState, type FunctionComponent } from "react";
import VexRuleForm from "./VexRuleForm";
import VexRuleResult from "./VexRuleResult";
import VexRuleSourceBadge, { isManualVexRule } from "./VexRuleSourceBadge";

interface VexRuleDetailsDialogProps {
  vexRule: VexRule | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // API base of this asset's VEX rules, e.g. /organizations/o/.../vex-rules
  urlBase: string;
  // Called after the rule was deleted or recreated, so callers can refetch.
  onChanged?: () => void;
}

// The parts of a rule this dialog edits; the rest is recreated verbatim.
type EditableRule = Pick<
  CreateVexRuleRequest,
  "title" | "celExpression" | "justification"
>;

const editableOf = (rule: VexRule): EditableRule => ({
  title: rule.title ?? "",
  celExpression: rule.celExpression ?? "",
  justification: rule.justification ?? "",
});

const VexRuleDetailsDialog: FunctionComponent<VexRuleDetailsDialogProps> = ({
  vexRule,
  isOpen,
  onOpenChange,
  urlBase,
  onChanged,
}) => {
  const [draft, setDraft] = useState<EditableRule>({
    title: "",
    celExpression: "",
    justification: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Seed the draft from the rule being shown, keyed by id so opening a different
  // row reseeds (React's recommended alternative to an effect).
  const [seededId, setSeededId] = useState<string | null>(null);
  if (vexRule && vexRule.id !== seededId) {
    setSeededId(vexRule.id);
    setDraft(editableOf(vexRule));
  }

  // Closing discards the draft, so the next open starts from the rule again.
  const handleOpenChange = (next: boolean) => {
    if (!next) setSeededId(null);
    onOpenChange(next);
  };

  if (!vexRule) return null;

  const original = editableOf(vexRule);
  const isDirty =
    draft.title !== original.title ||
    draft.celExpression !== original.celExpression ||
    draft.justification !== original.justification;

  const missingFields = [
    draft.title.trim() === "" && "a title",
    draft.justification.trim() === "" && "a justification",
  ].filter((field): field is string => typeof field === "string");

  const canUpdate =
    isDirty &&
    missingFields.length === 0 &&
    draft.celExpression.trim() !== "" &&
    checkCelSyntax(draft.celExpression) === null;

  const createRule = (rule: EditableRule) => {
    const body: CreateVexRuleRequest = {
      ...rule,
      eventType: vexRule.eventType,
      mechanicalJustification: vexRule.mechanicalJustification,
    };
    return browserApiClient(`${urlBase}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const resp = await browserApiClient(`${urlBase}/${vexRule.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error(resp.statusText);

      toast.success("VEX rule deleted");
      handleOpenChange(false);
      onChanged?.();
    } catch {
      toast.error("Failed to delete VEX rule");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!canUpdate) return false;

    // The id derives from the expression, so the old row goes first.
    const deleted = await browserApiClient(`${urlBase}/${vexRule.id}`, {
      method: "DELETE",
    });
    if (!deleted.ok) {
      toast.error("Failed to update VEX rule: could not remove the old rule");
      return false;
    }

    const created = await createRule(draft);
    if (!created.ok) {
      // Put it back rather than leaving the asset without the rule.
      const restored = await createRule(original);
      toast.error(
        restored.ok
          ? "Failed to update VEX rule — the previous rule was restored"
          : "Failed to update VEX rule and to restore the previous one",
      );
      onChanged?.();
      return false;
    }

    toast.success("VEX rule updated");
    handleOpenChange(false);
    onChanged?.();
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>VEX rule</DialogTitle>
          <DialogDescription>
            Change the expression, title or justification and update the rule.
            Rules are identified by their expression, so updating recreates it —
            the current rule is deleted and a new one is created
            {isManualVexRule(vexRule.vexSource)
              ? "."
              : ", which makes it your own rule instead of a synced one."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-row flex-wrap items-center gap-2">
          <VexRuleResult
            eventType={vexRule.eventType}
            mechanicalJustification={vexRule.mechanicalJustification}
          />
          <VexRuleSourceBadge vexSource={vexRule.vexSource} />
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <VexRuleForm
            baseUrl={urlBase}
            title={draft.title}
            onTitleChange={(title) => setDraft((d) => ({ ...d, title }))}
            celExpression={draft.celExpression}
            onCelExpressionChange={(celExpression) =>
              setDraft((d) => ({ ...d, celExpression }))
            }
            justification={draft.justification}
            onJustificationChange={(justification) =>
              setDraft((d) => ({ ...d, justification }))
            }
            eventType={vexRule.eventType}
          />
          {missingFields.length > 0 && (
            <FieldDescription className="flex flex-row items-center gap-1.5 self-end text-xs">
              <CircleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span>
                Add {missingFields.join(" and ")} to update this rule.
              </span>
            </FieldDescription>
          )}
          <DialogFooter className="mt-2">
            <Button variant="secondary" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Alert
              onConfirm={handleDelete}
              title="Delete VEX rule"
              description="Vulnerabilities this rule handles will reopen. This cannot be undone."
            >
              <Button variant="destructive" disabled={isDeleting}>
                Delete rule
              </Button>
            </Alert>
            <AsyncButton onClick={handleUpdate} disabled={!canUpdate}>
              Update VEX rule (recreate)
            </AsyncButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VexRuleDetailsDialog;
