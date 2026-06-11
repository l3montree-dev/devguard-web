import type { TrivyOperatorIntegrationDTO } from "@/types/api/api";
import React, { type FunctionComponent, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import TrivyOperatorIntegrationForm from "./TrivyOperatorIntegrationForm";
import { CopyCodeFragment } from "./CopyCode";
import { Button } from "../ui/button";

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: TrivyOperatorIntegrationDTO) => void;
}

export const TrivyOperatorIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
}) => {
  const [open, setOpen] = React.useState(false);
  const [createdIntegration, setCreatedIntegration] =
    React.useState<TrivyOperatorIntegrationDTO | null>(null);

  const handleNew = (integration: TrivyOperatorIntegrationDTO) => {
    setCreatedIntegration(integration);
    onNewIntegration(integration);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCreatedIntegration(null);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with Trivy Operator</DialogTitle>
          <DialogDescription>
            Connect a Kubernetes cluster running Trivy Operator. DevGuard will
            receive SbomReports and scan them automatically.
          </DialogDescription>
        </DialogHeader>
        {createdIntegration ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Integration created successfully. Copy the secret below and use it
              as the Bearer token in your Trivy Operator configuration. It will
              not be shown again.
            </p>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Secret</span>
              <CopyCodeFragment codeString={createdIntegration.secret} />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <TrivyOperatorIntegrationForm onNewIntegration={handleNew} />
        )}
      </DialogContent>
    </Dialog>
  );
};
