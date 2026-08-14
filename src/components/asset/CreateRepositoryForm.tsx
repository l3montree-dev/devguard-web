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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProject } from "@/context/ProjectContext";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { RequirementsLevel } from "@/types/api/api";
import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { GroupStructureFlowchart } from "../project/GroupStructureFlowchart";
import { Button } from "../ui/button";
import AssetForm, { type AssetFormValues } from "./AssetForm";

const defaultTitle = "Create new repository";
const defaultDescription =
  "A repository is a software project you would like to manage the risks of.";

interface Props {
  onSubmit: (req: AssetFormValues) => Promise<void>;
  // "dialog" renders the form inside a modal controlled by open/setOpen
  // "inline" renders it inside a card, used when there is no repository yet
  variant: "dialog" | "inline";
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  // override the copy, e.g. when the group already contains subgroups
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
  const activeOrg = useActiveOrg();
  const project = useProject();
  const form = useForm<AssetFormValues>({
    defaultValues: {
      repositoryProvider: "github",
      confidentialityRequirement: RequirementsLevel.Medium,
      integrityRequirement: RequirementsLevel.Medium,
      availabilityRequirement: RequirementsLevel.Medium,
      // the thresholds are only set once the reporting range is enabled
      cvssAutomaticTicketThreshold: [],
      riskAutomaticTicketThreshold: [],
    },
  });

  // subscribe to the name field so the flowchart can mirror it while typing
  const repositoryName = useWatch({ control: form.control, name: "name" });

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
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[2fr_1fr]">
        <Card
          data-testid="create-repository-form"
          data-tour="create-repository-button"
        >
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{formElement}</CardContent>
        </Card>
        <GroupStructureFlowchart
          highlight="repository"
          organizationName={activeOrg?.name ?? "Your organization"}
          groupName={project?.name ?? "Your group"}
          repositoryName={repositoryName}
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

export default CreateRepositoryForm;
