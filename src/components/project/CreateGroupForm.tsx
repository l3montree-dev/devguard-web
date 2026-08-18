// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import type { ProjectDTO } from "@/types/api/api";
import type { CreateProjectReq } from "@/types/api/req";
import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Button } from "../ui/button";
import { GroupStructureFlowchart } from "./GroupStructureFlowchart";
import { ProjectForm } from "./ProjectForm";

const defaultTitle = "Create new Group";
const defaultDescription =
  "Groups help to organize your software projects. For example, you can make a group per software project, and then split the frontend and backend into individual subgroups.";

interface Props {
  onSubmit: (req: CreateProjectReq) => Promise<void>;
  // "dialog" renders the form inside a modal controlled by open/setOpen
  // "inline" renders it inside a card, used when there is no group yet
  variant: "dialog" | "inline";
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  // override the copy, e.g. when creating a subgroup inside an existing group
  title?: string;
  description?: string;
}

export const CreateGroupForm: FunctionComponent<Props> = ({
  onSubmit,
  variant,
  open,
  setOpen,
  title = defaultTitle,
  description = defaultDescription,
}) => {
  const activeOrg = useActiveOrg();
  const form = useForm<ProjectDTO>({
    mode: "onBlur",
  });

  // subscribe to the name field so the flowchart can mirror it while typing
  const groupName = useWatch({ control: form.control, name: "name" });

  const formElement = (
    <FormProvider {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <ProjectForm
          forceVerticalSections
          form={form}
          hideDangerZone
          inputVariant={variant === "inline" ? "onCard" : "default"}
        />
        <div className="flex justify-end">
          <Button
            data-testid="create-group-submit-button"
            type="submit"
            isSubmitting={form.formState.isSubmitting}
          >
            Create
          </Button>
        </div>
      </form>
    </FormProvider>
  );

  if (variant === "inline") {
    return (
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[2fr_1fr]">
        <Card data-testid="create-group-form" data-tour="create-group-button">
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{formElement}</CardContent>
        </Card>
        <GroupStructureFlowchart
          organizationName={activeOrg?.name ?? "Your organization"}
          groupName={groupName}
        />
      </div>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <hr />
        {formElement}
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupForm;
