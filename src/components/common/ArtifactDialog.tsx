// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArtifactCreateUpdateRequest } from "@/types/api/api";
import { UseFormReturn } from "react-hook-form";
import ArtifactForm from "./ArtifactForm";
import { Form } from "../ui/form";
import { Button } from "../ui/button";

interface Props {
  form: UseFormReturn<ArtifactCreateUpdateRequest>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: ArtifactCreateUpdateRequest) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  isEditMode?: boolean;
  invalidUrls?: string[];
}

const ArtifactDialog = ({
  form,
  isOpen,
  onOpenChange,
  onSubmit,
  isEditMode = false,
  invalidUrls = [],
}: Props) => {
  const handleSubmit = async (data: ArtifactCreateUpdateRequest) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit artifact" : "Create new artifact"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the artifact details and upstream URLs."
              : "Create a new artifact to associate with this asset version."}
          </DialogDescription>
        </DialogHeader>
        <hr />
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <ArtifactForm
              form={form}
              invalidUrls={invalidUrls}
              isEditMode={isEditMode}
            />
            <DialogFooter>
              <div className="flex w-full flex-col justify-end gap-4 items-end">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange?.(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    variant="default"
                  >
                    {form.formState.isSubmitting
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                        ? "Update"
                        : "Create"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ArtifactDialog;
