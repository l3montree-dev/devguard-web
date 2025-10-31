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
import { ArtifactCreateUpdateRequest, ArtifactDTO } from "@/types/api/api";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  form: UseFormReturn<ArtifactCreateUpdateRequest>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: ArtifactCreateUpdateRequest) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  isEditMode?: boolean;
  invalidUrls?: string[];
}

const ArtifactForm = ({
  form,
  isOpen,
  onOpenChange,
  onSubmit,
  isEditMode = false,
  invalidUrls = [],
}: Props) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "informationSources" as const,
  });

  useEffect(() => {
    if (invalidUrls.length > 0) {
      form.trigger("informationSources");
    }
  }, [invalidUrls, form]);

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
                <FormLabel>Information Sources (Upstream URLs)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ url: "" })}
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

              <div className="flex items-center gap-2 text-muted-foreground">
                <InformationCircleIcon className="h-7 w-7 shrink-0" />
                <span className="text-xs">
                  You can add several upstream VEX (Vulnerability Exploitability eXchange) URLs here. DevGuard will sync the given vulnerability assessment results of these VEX Documents to your dependency vulnerabilities. This is useful if your supplier already offers you with this standard exchange format for vulnerability assessments. Currently, this has to be a public reachable URL.
                </span>
              </div>

              {fields.map((field, index) => {
                const isInvalid = invalidUrls.includes(field.url);
                return (
                  <div key={field.id} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`informationSources.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Enter upstream URL (e.g., https://example.com/vex.json)"
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
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ArtifactForm;
