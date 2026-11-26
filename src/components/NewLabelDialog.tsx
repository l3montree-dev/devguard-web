// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { toast } from "@/lib/toast";
import { ApiError } from "@/services/apiClient";
import type { ConfigScope } from "@/services/configFileService";
import type { Label, LabelCreateRequest } from "@/services/labelService";
import { createLabel, updateLabel } from "@/services/labelService";
import { useState, type FunctionComponent, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { classNames } from "@/utils/common";

interface Props {
  scope: ConfigScope;
  Trigger: ReactNode;
  onSuccess: () => void;
  label?: Label;
}

const NewLabelDialog: FunctionComponent<Props> = ({
  scope,
  Trigger,
  onSuccess,
  label,
}) => {
  const labelMaxLength = 256;
  const descriptionMaxLength = 2000;

  const defaultObject = {
    label: label?.label ?? "",
    backgroundColor: label?.backgroundColor ?? "#2824f9",
    description: label?.description ?? "",
  };
  const [open, setOpen] = useState(false);
  const form = useForm<LabelCreateRequest>({
    defaultValues: defaultObject,
  });

  const handleOpenChange = (next: boolean) => {
    if (next) form.reset(defaultObject);
    setOpen(next);
  };

  const handleSubmit = async (data: LabelCreateRequest) => {
    if (!label) {
      try {
        await createLabel(scope, data);
      } catch (e) {
        toast.error(
          e instanceof ApiError && e.status === 409
            ? `A label named ${data.label} with this color already exists`
            : "Failed to create label",
        );
        return;
      }
      toast.success("Label created");
    } else {
      try {
        await updateLabel(scope, data, label.id);
      } catch (e) {
        toast.error("Failed to update label");
        return;
      }
      toast.success("Label updated");
    }

    setOpen(false);
    onSuccess();
    return;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label ? "Edit label" : "New label"}</DialogTitle>
          <DialogDescription>
            Labels are inherited, so a label created here is also available in
            everything below this level.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <p
                    className={classNames(
                      "m-1 text-right text-xs",
                      field.value.length > labelMaxLength
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {field.value.length} / {labelMaxLength}
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <p
                    className={classNames(
                      "m-1 text-right text-xs",
                      field.value.length > descriptionMaxLength
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {field.value.length} / {descriptionMaxLength}
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backgroundColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input type="color" className="h-10 w-20 p-1" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {label ? "Save" : "Add"} label
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLabelDialog;
