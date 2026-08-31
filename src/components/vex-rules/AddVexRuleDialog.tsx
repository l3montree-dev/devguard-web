// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useState } from "react";
import type { FunctionComponent } from "react";
import { AsyncButton, Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VexRuleForm from "./VexRuleForm";
import type {
  CreateVexRuleRequest,
  VexRuleEventType,
  VexRulePrefill,
  VexRuleVulnContext,
} from "@/types/view/vexRules";
import { createVexRule } from "@/services/vexRuleService";
import { toast } from "@/lib/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldDescription } from "@/components/ui/field";
import { ChevronDown, CircleAlert } from "lucide-react";
import { removeUnderscores, vexOptionMessages } from "@/utils/view";
import type { MechanicalJustificationType } from "@/types/view/vuln";

import { checkCelSyntax } from "@/components/common/celLinter";

import type { AssetScope } from "@/services/vexRuleService";

const MECHANICAL_JUSTIFICATIONS = Object.keys(
  vexOptionMessages,
) as MechanicalJustificationType[];
const DEFAULT_MECHANICAL_JUSTIFICATION = MECHANICAL_JUSTIFICATIONS[2];

interface AddVexRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: AssetScope;
  onCreated: () => void;
  // Values to open with, from a dependency path, the playground or a recommendation.
  prefill?: VexRulePrefill;
  // When set, the form previews the rule's effect on this specific vulnerability.
  currentVuln?: VexRuleVulnContext;
  // "reduced" focuses the effect on the current vulnerability and collapses the
  // expression; "full" is the expert flow with an editable expression.
  variant?: "full" | "reduced";
}

const AddVexRuleDialog: FunctionComponent<AddVexRuleDialogProps> = ({
  open,
  onOpenChange,
  scope,
  onCreated,
  prefill,
  currentVuln,
  variant = "full",
}) => {
  const isReduced = variant === "reduced";
  const [title, setTitle] = useState("");
  const [celExpression, setCelExpression] = useState("");
  const [justification, setJustification] = useState("");
  const [selectedOption, setSelectedOption] =
    useState<MechanicalJustificationType>(DEFAULT_MECHANICAL_JUSTIFICATION);
  const [eventType, setEventType] = useState<VexRuleEventType>("falsePositive");

  // Seed from the prefill whenever the dialog opens (adjusting state during
  // render, React's alternative to an effect).
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTitle(prefill?.title ?? "");
      setCelExpression(prefill?.celExpression ?? "");
      setJustification(prefill?.justification ?? "");
      setSelectedOption(
        prefill?.mechanicalJustification ?? DEFAULT_MECHANICAL_JUSTIFICATION,
      );
    }
  }

  // Both end up in the VEX statement, so neither can be left out.
  const missingFields = [
    title.trim() === "" && "a title",
    justification.trim() === "" && "a justification",
  ].filter((field): field is string => typeof field === "string");

  const canSubmit =
    missingFields.length === 0 &&
    celExpression.trim() !== "" &&
    checkCelSyntax(celExpression) === null &&
    justification.length <= 4000;

  const reset = () => {
    setCelExpression("");
    setJustification("");
    setTitle("");
    setSelectedOption(DEFAULT_MECHANICAL_JUSTIFICATION);
    setEventType("falsePositive");
  };

  const handleSubmit = async (eventType: VexRuleEventType) => {
    if (!canSubmit) return false;

    const body: CreateVexRuleRequest = {
      title,
      justification,
      celExpression,
      eventType,
      // Only a false positive carries a mechanical justification.
      mechanicalJustification:
        eventType === "falsePositive" ? selectedOption : undefined,
      wasRecommended: prefill?.wasRecommended,
    };

    try {
      await createVexRule(scope, body as never);
    } catch (error) {
      toast.error("Failed to create VEX rule: " + String(error));
      return false;
    }

    toast.success("VEX rule created");
    reset();
    onCreated();
    onOpenChange(false);
    return true;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add VEX rule</DialogTitle>
          <DialogDescription>
            {isReduced
              ? "Check how this rule affects the current vulnerability, then add a justification. The matching rule was generated from the dependency path you selected."
              : "Write a CEL (Common Expression Language) expression to automatically match vulnerabilities. The variable vuln (with fields such as cveId, componentPurl and vulnerabilityPath) and the helper matchesPattern(vuln, pattern) are available."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <Tabs
            value={eventType}
            onValueChange={(value) => setEventType(value as VexRuleEventType)}
          >
            <TabsList>
              <TabsTrigger
                data-testid="vex-rule-tab-false-positive"
                value="falsePositive"
              >
                False positive
              </TabsTrigger>
              <TabsTrigger data-testid="vex-rule-tab-accepted" value="accepted">
                Accept risk
              </TabsTrigger>
              <TabsTrigger data-testid="vex-rule-tab-reopened" value="reopened">
                Reopen
              </TabsTrigger>
            </TabsList>
            <TabsContent value={eventType} className="flex flex-col gap-4">
              <VexRuleForm
                scope={scope}
                title={title}
                onTitleChange={setTitle}
                celExpression={celExpression}
                onCelExpressionChange={setCelExpression}
                justification={justification}
                onJustificationChange={setJustification}
                currentVuln={currentVuln}
                variant={variant}
                eventType={eventType}
              />
              {eventType === "reopened" && (
                <FieldDescription className="text-xs">
                  Reopen rules only apply to vulnerabilities currently accepted
                  as a known risk. They are evaluated twice a day, so matching
                  vulnerabilities may take up to 12 hours to reopen.
                </FieldDescription>
              )}
              {missingFields.length > 0 && (
                <FieldDescription className="flex flex-row items-center gap-1.5 text-xs self-end">
                  <CircleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Add {missingFields.join(" and ")} to create this rule.
                  </span>
                </FieldDescription>
              )}
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {eventType === "falsePositive" ? (
              <div className="flex flex-row items-center">
                <AsyncButton
                  data-testid="vex-rule-mark-false-positive"
                  variant="default"
                  className="mr-0 rounded-r-none pr-0 capitalize"
                  onClick={() => handleSubmit("falsePositive")}
                  disabled={!canSubmit}
                >
                  {removeUnderscores(selectedOption)}
                </AsyncButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      className="flex items-center rounded-l-none pl-1 pr-2"
                      disabled={!canSubmit}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {MECHANICAL_JUSTIFICATIONS.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setSelectedOption(option)}
                      >
                        <div className="flex flex-col">
                          <span className="capitalize">
                            {removeUnderscores(option)}{" "}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {vexOptionMessages[option]}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <AsyncButton
                data-testid={
                  eventType === "accepted"
                    ? "vex-rule-mark-accepted-risk"
                    : "vex-rule-mark-reopened"
                }
                onClick={() => handleSubmit(eventType)}
                disabled={!canSubmit}
                variant="default"
              >
                {eventType === "accepted" ? "Accept risk" : "Reopen"}
              </AsyncButton>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVexRuleDialog;
