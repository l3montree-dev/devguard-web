"use client";

import { FunctionComponent, useState } from "react";
import { AsyncButton, Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (justification: string) => Promise<boolean>;
}

const CommentDialog: FunctionComponent<CommentDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [justification, setJustification] = useState<string>("");

  const handleSubmit = async () => {
    const success = await onSubmit(justification);
    if (success) {
      setJustification("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogDescription>
            Add a comment to document your analysis, findings, or any relevant
            information about this vulnerability. Comments help track the
            decision-making process and provide context for future reference.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">Comment</label>
            <MarkdownEditor
              className="!bg-card"
              placeholder="Add your comment here..."
              value={justification}
              setValue={(value) => setJustification(value ?? "")}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <AsyncButton onClick={handleSubmit}>Add Comment</AsyncButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
