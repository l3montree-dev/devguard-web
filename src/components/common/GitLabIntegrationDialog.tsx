import { GitLabIntegrationDTO } from "@/types/api/api";
import React, { FunctionComponent, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import GitLabIntegrationForm from "./GitLabIntegrationForm";

interface Props {
  Button: ReactNode;
  onNewIntegration: (integration: GitLabIntegrationDTO) => void;
}
export const GitLabIntegrationDialog: FunctionComponent<Props> = ({
  onNewIntegration,
  Button: Trigger,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with GitLab</DialogTitle>
          <DialogDescription>
            To integrate with GitLab a personal access token, a group access
            token or a project access token is necessary.
          </DialogDescription>
        </DialogHeader>
        <GitLabIntegrationForm
          onNewIntegration={onNewIntegration}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
