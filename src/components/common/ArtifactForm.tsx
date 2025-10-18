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
import { Button } from "../ui/button";
import { FormProvider, UseFormReturn, useFieldArray } from "react-hook-form";
import { ArtifactDTO } from "@/types/api/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Trash2, Plus } from "lucide-react";
import Alert from "./Alert";
import ListItem from "./ListItem";

interface Props {
  form: UseFormReturn<ArtifactDTO>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: ArtifactDTO) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  isEditMode?: boolean;
  invalidUrls?: string[]; 
}

const ArtifactForm = ({
  form,
  isOpen,
  onOpenChange,
  onSubmit,
  onDelete,
  isEditMode = false,
  invalidUrls = [], 
}: Props) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "upstreamUrls",
  });

  const handleSubmit = async (data: ArtifactDTO) => {
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
            <FormField
              control={form.control}
              name="artifactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artifact Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter artifact name"
                      disabled={isEditMode}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Upstream URLs</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ upstreamUrl: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Upstream URL
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No upstream URLs added yet. Click &quot;Add URL&quot; to add
                  one.
                </p>
              )}

              {fields.map((field, index) => {
                const isInvalid = invalidUrls.includes(field.upstreamUrl);
                return (
                  <div key={field.id} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`upstreamUrls.${index}.upstreamUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Enter upstream URL (e.g., https://example.com/artifact.json)"
                                  className={
                                    isInvalid
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : ""
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {isInvalid && (
                      <p className="text-sm text-red-500 pl-3">
                        This URL is invalid or could not be reached
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

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
                <div className="flex gap-2 w-full">
                  {isEditMode && onDelete && (
                    <ListItem
                      Title="Delete Artifact"
                      Description={
                        "This will delete the artifact and all of its data. This action cannot be undone."
                      }
                      Button={
                        <Alert
                          onConfirm={onDelete}
                          title="Delete Artifact"
                          description="Are you sure you want to delete this artifact? This action cannot be undone."
                        >
                          <Button type="button" variant="destructive">
                            Delete
                          </Button>
                        </Alert>
                      }
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ArtifactForm;
