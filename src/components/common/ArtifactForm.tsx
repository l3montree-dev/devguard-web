// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ArtifactCreateUpdateRequest } from "@/types/api/api";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "../ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface Props {
  form: UseFormReturn<ArtifactCreateUpdateRequest>;
  isEditMode?: boolean;
  invalidUrls?: string[];
}

const ArtifactForm = ({
  form,
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

  return (
    <>
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
            No upstream URLs added yet. Click &quot;Add URL&quot; to add one.
          </p>
        )}

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
    </>
  );
};

export default ArtifactForm;
