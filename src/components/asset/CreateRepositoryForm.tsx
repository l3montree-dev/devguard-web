// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import AssetForm from "./AssetForm";
import type { AssetFormValues } from "@/types/view/asset";

const defaultTitle = "Create new repository";
const defaultDescription =
  "A repository is a software project you would like to manage the risks of.";

interface Props {
  onSubmit: (req: AssetFormValues) => Promise<void>;
  // "dialog" renders the form inside a modal controlled by open/setOpen
  // "inline" renders just the form, used inside the getting started steps when there is no repository yet
  variant: "dialog" | "inline";
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
}

export const CreateRepositoryForm: FunctionComponent<Props> = ({
  onSubmit,
  variant,
  open,
  setOpen,
  title = defaultTitle,
  description = defaultDescription,
}) => {
  const form = useForm<AssetFormValues>({
    defaultValues: {
      repositoryProvider: "github",
      confidentialityRequirement: "medium",
      integrityRequirement: "medium",
      availabilityRequirement: "medium",
      cvssAutomaticTicketThreshold: [],
      riskAutomaticTicketThreshold: [],
    },
  });

  const submitButton = (
    <Button
      data-testid="create-repository-submit-button"
      isSubmitting={form.formState.isSubmitting}
      type="submit"
      variant="default"
    >
      Create
    </Button>
  );

  const formElement = (
    <FormProvider {...form}>
      <form className="flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <AssetForm
          forceVerticalSections
          form={form}
          showVulnsManagement={false}
          showSecurityRequirements={false}
          inputVariant={variant === "inline" ? "onCard" : "default"}
        />
        {variant === "dialog" ? (
          <DialogFooter>{submitButton}</DialogFooter>
        ) : (
          <div className="flex justify-end">{submitButton}</div>
        )}
      </form>
    </FormProvider>
  );

  if (variant === "inline") {
    return (
      <div
        className="flex flex-col gap-8"
        data-testid="create-repository-form"
        data-tour="create-repository-button"
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
