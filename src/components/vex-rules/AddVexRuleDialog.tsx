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
import type { VexRuleVulnContext } from "./vexRuleParser";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "@/lib/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldDescription } from "@/components/ui/field";
import { ChevronDown, CircleAlert } from "lucide-react";
import { removeUnderscores, vexOptionMessages } from "@/utils/view";
import { checkCelSyntax } from "@/components/common/celLinter";

interface AddVexRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseUrl: string;
  onCreated: () => void;
  // Prefill the form (e.g. when opened from a specific dependency path, or from
  // a crowdsourced recommendation).
  initialTitle?: string;
  initialCelExpression?: string;
  initialJustification?: string;
  initialMechanicalJustification?: string;
  // When set, the form previews the rule's effect on this specific vulnerability.
  currentVuln?: VexRuleVulnContext;
  // "full": the expert flow with an editable CEL expression editor.
  // "reduced": the guided flow (e.g. opened from a dependency path) — focuses the
  // effect on the current vulnerability, the CEL expression is collapsed and read-only.
  variant?: "full" | "reduced";
}

const AddVexRuleDialog: FunctionComponent<AddVexRuleDialogProps> = ({
  open,
  onOpenChange,
  baseUrl,
  onCreated,
  initialTitle,
  initialCelExpression,
  initialJustification,
  initialMechanicalJustification,
  currentVuln,
  variant = "full",
}) => {
  const isReduced = variant === "reduced";
  const [title, setTitle] = useState("");
  const [celExpression, setCelExpression] = useState("");
  const [justification, setJustification] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>(
    Object.keys(vexOptionMessages)[2],
  );

  // Seed the form from the prefill each time the dialog transitions to open.
  // Adjusting state during render (React's recommended alternative to an effect).
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTitle(initialTitle ?? "");
      setCelExpression(initialCelExpression ?? "");
      setJustification(initialJustification ?? "");
      if (initialMechanicalJustification) {
        setSelectedOption(initialMechanicalJustification);
      }
    }
  }

  // A rule has to say what it is and why — both are part of the VEX statement
  // it produces, so neither can be left out.
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
    setSelectedOption(Object.keys(vexOptionMessages)[2]);
  };

  const handleSubmit = async (eventType: "falsePositive" | "accepted") => {
    if (!canSubmit) return false;

    const resp = await browserApiClient(baseUrl + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        justification,
        celExpression,
        eventType,
        mechanicalJustification:
          eventType === "falsePositive" ? selectedOption : undefined,
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      toast.error("Failed to create VEX rule: " + errorText);
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
          <VexRuleForm
            baseUrl={baseUrl}
            title={title}
            onTitleChange={setTitle}
            celExpression={celExpression}
            onCelExpressionChange={setCelExpression}
            justification={justification}
            onJustificationChange={setJustification}
            currentVuln={currentVuln}
            variant={variant}
          />
          {missingFields.length > 0 && (
            <FieldDescription className="flex flex-row items-center gap-1.5 text-xs self-end">
              <CircleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span>
                Add {missingFields.join(" and ")} to create this rule.
              </span>
            </FieldDescription>
          )}
          <DialogFooter className="mt-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <AsyncButton
              data-testid="mark-accepted-risk"
              onClick={() => handleSubmit("accepted")}
              disabled={!canSubmit}
              variant="secondary"
            >
              Accept risk
            </AsyncButton>
            <div className="flex flex-row items-center">
              <AsyncButton
                data-testid="mark-false-positive"
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
                  {Object.entries(vexOptionMessages).map(
                    ([option, description]) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setSelectedOption(option)}
                      >
                        <div className="flex flex-col">
                          <span className="capitalize">
                            {removeUnderscores(option)}{" "}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {description}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVexRuleDialog;
