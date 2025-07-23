import { JiraIntegrationDTO } from "@/types/api/api";
import React, { FunctionComponent, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import JiraIntegrationForm from "./JiraIntegrationForm";

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: JiraIntegrationDTO) => void;
}
export const JiraIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with Jira</DialogTitle>
          <DialogDescription>
            To integrate with Jira, you need to provide your Personal Access
            Token
          </DialogDescription>
        </DialogHeader>
        <JiraIntegrationForm onNewIntegration={onNewIntegration} />
      </DialogContent>
    </Dialog>
  );
};
