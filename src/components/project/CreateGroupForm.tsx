// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProjectDTO } from "@/types/dto";
import type { ProjectCreateRequest } from "@/services/projectService";
import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { ProjectForm } from "./ProjectForm";

const defaultTitle = "Create new Group";
const defaultDescription =
  "Groups help to organize your software projects. For example, you can make a group per software project, and then split the frontend and backend into individual subgroups.";

interface Props {
  onSubmit: (req: ProjectCreateRequest) => Promise<void>;
  // "dialog" renders the form inside a modal controlled by open/setOpen
  // "inline" renders just the form, used inside the getting started steps when there is no group yet
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
  const form = useForm<ProjectDTO>({
    mode: "onBlur",
  });

  const formElement = (
    <FormProvider {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <ProjectForm
          forceVerticalSections
          form={form}
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
      <div
        className="flex flex-col gap-8"
        data-testid="create-group-form"
        data-tour="create-group-button"
      >
        {formElement}
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
