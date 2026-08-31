// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import AuthGuard from "@/components/AuthGuard";
import { AsyncButton, Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { toast } from "@/lib/toast";
import type { AdvisoryState } from "@/types/view/advisory";
import { Lightbulb } from "lucide-react";
import dynamic from "next/dynamic";
import type { FunctionComponent } from "react";
import { useState } from "react";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  { ssr: false },
);

const MAX_LENGTH = 4000;

interface AdvisoryComposerProps {
  state: AdvisoryState;
  onComment: (justification: string) => Promise<boolean>;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onWithdraw: () => void;
}

const AdvisoryComposer: FunctionComponent<AdvisoryComposerProps> = ({
  state,
  onComment,
  onEdit,
  onDelete,
  onPublish,
  onWithdraw,
}) => {
  const [justification, setJustification] = useState("");

  const attemptComment = async () => {
    if (justification.trim().length === 0) {
      toast.warning("Comment can’t be empty", {
        description: "Write a comment before posting.",
      });
      return false;
    }
    if (justification.length > MAX_LENGTH) {
      toast.warning("Comment is too long", {
        description: `Please keep it under ${MAX_LENGTH} characters.`,
      });
      return false;
    }

    const success = await onComment(justification);
    if (success) {
      setJustification("");
    }
    return success;
  };

  const handleShortcut = (e: React.KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    // Plain ⌘ + Enter is left to the editor, where it inserts a new line.
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      attemptComment();
    }
  };

  return (
    <div className="flex flex-col gap-2" onKeyDown={handleShortcut}>
      <div className="flex flex-col gap-3 pt-6">
        <AuthGuard require="admin">
          <>
            <MarkdownEditor
              placeholder="Add a comment…"
              value={justification}
              setValue={(value) => setJustification(value ?? "")}
              maxLength={MAX_LENGTH}
            />

            <div className="flex flex-row flex-wrap items-center justify-between gap-2">
              <div className="flex flex-row items-center gap-2">
                {state === "draft" && (
                  <>
                    <Button onClick={onDelete} variant="destructive">
                      Delete Draft
                    </Button>
                    <Button onClick={onEdit} variant="outline">
                      Change Draft
                    </Button>
                    <Button onClick={onPublish} variant="secondary">
                      Publish Draft
                    </Button>
                  </>
                )}
                {state === "public" && (
                  <Button onClick={onWithdraw} variant="destructive">
                    Withdraw Advisory
                  </Button>
                )}
              </div>
              <AsyncButton data-testid="add-comment" onClick={attemptComment}>
                Comment
              </AsyncButton>
            </div>
          </>
        </AuthGuard>
      </div>

      <AuthGuard require="admin">
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <Lightbulb className="h-3.5 w-3.5" />
            Pro tip
          </span>
          <span className="flex items-center gap-1.5">
            <KbdGroup>
              {["⌘", "⇧", "⏎"].map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </KbdGroup>
            Comment
          </span>
        </div>
      </AuthGuard>
    </div>
  );
};

export default AdvisoryComposer;
