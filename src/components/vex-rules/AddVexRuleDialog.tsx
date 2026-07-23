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
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "@/lib/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { removeUnderscores, vexOptionMessages } from "@/utils/view";
import { checkCelSyntax } from "@/components/common/celLinter";

interface AddVexRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseUrl: string;
  assetVersionId: string;
  onCreated: () => void;
}

const AddVexRuleDialog: FunctionComponent<AddVexRuleDialogProps> = ({
  open,
  onOpenChange,
  baseUrl,
  assetVersionId,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [celExpression, setCelExpression] = useState("");
  const [justification, setJustification] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>(
    Object.keys(vexOptionMessages)[2],
  );

  const canSubmit =
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
            Write a CEL (Common Expression Language) expression to automatically
            match vulnerabilities. The variable vuln (with fields such as cveId,
            componentPurl and vulnerabilityPath) and the helper
            matchesPattern(vuln, pattern) are available.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <VexRuleForm
            baseUrl={baseUrl}
            assetVersionId={assetVersionId}
            title={title}
            onTitleChange={setTitle}
            celExpression={celExpression}
            onCelExpressionChange={setCelExpression}
            justification={justification}
            onJustificationChange={setJustification}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex flex-row items-center">
              <AsyncButton
                data-testid="mark-false-positive"
                variant="secondary"
                className="mr-0 rounded-r-none pr-0 capitalize"
                onClick={() => handleSubmit("falsePositive")}
                disabled={!canSubmit}
              >
                {removeUnderscores(selectedOption)}
              </AsyncButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
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
            <AsyncButton
              data-testid="mark-accepted-risk"
              onClick={() => handleSubmit("accepted")}
              disabled={!canSubmit}
            >
              Accept risk
            </AsyncButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVexRuleDialog;
