"use client";

import { FunctionComponent, useState } from "react";
import Link from "next/link";
import { AsyncButton, Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { documentationLinks } from "@/const/documentationLinks";
import dynamic from "next/dynamic";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

interface AcceptRiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (justification: string) => Promise<boolean>;
  /** Optional custom description for bulk actions */
  description?: React.ReactNode;
}

const AcceptRiskDialog: FunctionComponent<AcceptRiskDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  description,
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
          <DialogTitle>Accept Risk</DialogTitle>
          <DialogDescription>
            {description ?? (
              <>
                By accepting the risk, you acknowledge that you are aware of the
                vulnerability and its potential impact on your project. This
                action should only be taken after careful consideration and, if
                applicable, consultation with relevant stakeholders. You can
                find more information about accepting risks in our{" "}
                <Link
                  href={documentationLinks.acceptRisk}
                  target="_blank"
                  className="underline hover:text-primary"
                >
                  documentation
                </Link>
                .
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="block mb-2 text-sm font-semibold">
              Justification
            </label>
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
            <AsyncButton onClick={handleSubmit}>Accept Risk</AsyncButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AcceptRiskDialog;
