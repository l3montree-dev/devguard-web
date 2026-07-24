// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AuthGuard from "@/components/AuthGuard";
import { AsyncButton, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { toast } from "@/lib/toast";
import type { VulnEventDTO } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { removeUnderscores, vexOptionMessages } from "@/utils/view";
import { CheckIcon } from "@heroicons/react/24/outline";
import { ChevronDown, Lightbulb } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { FunctionComponent, ReactNode } from "react";
import { useState } from "react";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  { ssr: false },
);

const MAX_LENGTH = 4000;
// The FP dropdown defaults to "Vulnerable code not in execute path".
const DEFAULT_FP_OPTION = Object.keys(vexOptionMessages)[2];

export interface AssessmentSubmit {
  status: VulnEventDTO["type"];
  justification?: string;
  mechanicalJustification?: string;
}

interface VulnAssessmentComposerProps {
  /** Current vulnerability state (e.g. "open", "accepted", "falsePositive"). */
  state: string;
  /** Whether the vuln is currently held by a VEX rule (blocks reopening). */
  isHandledByVexRule: boolean;
  onSubmit: (data: AssessmentSubmit) => Promise<boolean>;
  /** Opens the (kept) VEX rule dialog — VEX rules need a CEL expression. */
  onCreateVexRule: () => void;
  /** Extra controls rendered on the left of the action row (e.g. Create Ticket). */
  secondaryActions?: ReactNode;
  /** When set, shows the "comment is synced with …" hint. */
  ticketUrl?: string | null;
}

const VulnAssessmentComposer: FunctionComponent<
  VulnAssessmentComposerProps
> = ({
  state,
  isHandledByVexRule,
  onSubmit,
  onCreateVexRule,
  secondaryActions,
  ticketUrl,
}) => {
  const [justification, setJustification] = useState("");
  const [fpOption, setFpOption] = useState(DEFAULT_FP_OPTION);

  const isOpen = state === "open";

  const submit = async (data: AssessmentSubmit) => {
    const success = await onSubmit(data);
    if (success) {
      setJustification("");
      setFpOption(DEFAULT_FP_OPTION);
    }
    return success;
  };

  // Actions stay enabled so the user gets explicit feedback: an empty or
  // over-long justification is rejected with a toast rather than a silently
  // disabled button.
  const attemptSubmit = async (data: AssessmentSubmit) => {
    if (justification.trim().length === 0) {
      toast.warning(
        data.status === "comment"
          ? "Comment can’t be empty"
          : "Justification required",
        {
          description:
            data.status === "comment"
              ? "Write a comment before posting."
              : "Add a justification before recording this decision.",
        },
      );
      return false;
    }
    if (justification.length > MAX_LENGTH) {
      toast.warning("Justification is too long", {
        description: `Please keep it under ${MAX_LENGTH} characters.`,
      });
      return false;
    }
    return submit(data);
  };

  // Keyboard shortcuts, scoped to the composer card. ⌘/Ctrl is accepted on
  // every platform; the browser/editor default for the matched keys is
  // suppressed so the assessment action wins instead.
  const handleShortcut = (e: React.KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;

    // Comment (⌘ + Shift + Enter) is available in every state. Plain ⌘ + Enter
    // is left to the editor, where it inserts a new line.
    if (e.key === "Enter") {
      if (!e.shiftKey) return;
      e.preventDefault();
      attemptSubmit({ status: "comment", justification });
      return;
    }

    // The remaining actions only exist while the vuln is open.
    if (!isOpen) return;
    switch (e.key.toLowerCase()) {
      case "a":
        e.preventDefault();
        attemptSubmit({ status: "accepted", justification });
        break;
      case "f":
        e.preventDefault();
        attemptSubmit({
          status: "falsePositive",
          justification,
          mechanicalJustification: fpOption,
        });
        break;
      case "r":
        e.preventDefault();
        onCreateVexRule();
        break;
    }
  };

  const shortcuts = [
    { keys: ["⌘", "⇧", "⏎"], label: "Comment" },
    ...(isOpen
      ? [
          { keys: ["⌘", "A"], label: "Accept" },
          { keys: ["⌘", "F"], label: "False positive" },
          { keys: ["⌘", "R"], label: "Create VEX rule" },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-2">
      <Card className="" onKeyDown={handleShortcut}>
        <CardContent className="flex flex-col gap-3 pt-6">
          <AuthGuard require="member">
            <>
              <MarkdownEditor
                className=""
                value={justification}
                setValue={(value) => setJustification(value ?? "")}
                placeholder={
                  isOpen
                    ? "Add a comment, or pick an assessment below…"
                    : "Add a comment…"
                }
                maxLength={MAX_LENGTH}
              />

              {isOpen ? (
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex flex-row flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2">
                      {secondaryActions}
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <div className="flex flex-row items-center">
                        <AsyncButton
                          data-testid="mark-false-positive"
                          variant="secondary"
                          className="rounded-r-none"
                          onClick={() =>
                            attemptSubmit({
                              status: "falsePositive",
                              justification,
                              mechanicalJustification: fpOption,
                            })
                          }
                        >
                          False Positive
                        </AsyncButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              className="-ml-px rounded-l-none px-2"
                              aria-label="Choose false positive justification"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="max-w-sm">
                            {Object.entries(vexOptionMessages).map(
                              ([option, description]) => (
                                <DropdownMenuItem
                                  key={option}
                                  onClick={() => setFpOption(option)}
                                >
                                  <div className="flex flex-row items-start gap-2">
                                    <CheckIcon
                                      className={classNames(
                                        "mt-0.5 h-4 w-4 shrink-0",
                                        option === fpOption
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="capitalize">
                                        {removeUnderscores(option)}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {description}
                                      </span>
                                    </div>
                                  </div>
                                </DropdownMenuItem>
                              ),
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <Button variant="secondary" onClick={onCreateVexRule}>
                        Create VEX Rule
                      </Button>

                      <AsyncButton
                        data-testid="mark-accepted-risk"
                        variant="secondary"
                        onClick={() =>
                          attemptSubmit({ status: "accepted", justification })
                        }
                      >
                        Accept
                      </AsyncButton>

                      <AsyncButton
                        data-testid="add-comment"
                        onClick={() =>
                          attemptSubmit({ status: "comment", justification })
                        }
                      >
                        Comment
                      </AsyncButton>
                    </div>
                  </div>
                  <p className="text-right text-xs text-muted-foreground mt-2">
                    False positive reason:{" "}
                    <span className="capitalize text-foreground">
                      {removeUnderscores(fpOption)}
                    </span>
                  </p>
                </div>
              ) : isHandledByVexRule ? (
                <div className="flex flex-row flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    This vuln was handled by a VEX rule. Remove or adjust the
                    VEX rule to reopen it.
                  </p>
                  <AsyncButton
                    data-testid="add-comment"
                    onClick={() =>
                      attemptSubmit({ status: "comment", justification })
                    }
                  >
                    Comment
                  </AsyncButton>
                </div>
              ) : (
                <div className="flex flex-row flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    You can reopen this vuln if you plan to mitigate the risk
                    now, or accepted it by accident.
                  </p>
                  <div className="flex flex-row items-center gap-2">
                    <AsyncButton
                      variant="secondary"
                      onClick={() =>
                        attemptSubmit({ status: "reopened", justification })
                      }
                    >
                      Reopen
                    </AsyncButton>
                    <AsyncButton
                      data-testid="add-comment"
                      onClick={() =>
                        attemptSubmit({ status: "comment", justification })
                      }
                    >
                      Comment
                    </AsyncButton>
                  </div>
                </div>
              )}
            </>
          </AuthGuard>

          {ticketUrl && (
            <small className="block w-full text-right text-muted-foreground">
              Comment will be synced with{" "}
              <Link href={ticketUrl} target="_blank">
                {ticketUrl}
              </Link>
            </small>
          )}
        </CardContent>
      </Card>

      <AuthGuard require="member">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs text-muted-foreground justify-center mt-4">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <Lightbulb className="h-3.5 w-3.5" />
            Pro tip
          </span>
          {shortcuts.map((shortcut) => (
            <span key={shortcut.label} className="flex items-center gap-1.5">
              <KbdGroup>
                {shortcut.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </KbdGroup>
              {shortcut.label}
            </span>
          ))}
        </div>
      </AuthGuard>
    </div>
  );
};

export default VulnAssessmentComposer;
