// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ArtifactCreateUpdateRequest } from "@/types/api/api";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "../ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import Callout from "./Callout";

import { validateArtifactNameAgainstPurlSpec } from "../../utils/common";
import { Alert, AlertDescription } from "../ui/alert";

interface Props {
  form: UseFormReturn<ArtifactCreateUpdateRequest>;
  isEditMode?: boolean;
}

const ArtifactForm = ({ form, isEditMode = false }: Props) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "informationSources" as const,
  });

  const artifactName = form.watch("artifactName");

  const purlValidation = validateArtifactNameAgainstPurlSpec(artifactName);

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
            <FormDescription>
              Artifact names should be{" "}
              <Link
                target="_blank"
                href="https://github.com/package-url/purl-spec"
              >
                Package-URLs
              </Link>{" "}
              without the Version Information. Format:{" "}
              <code className="text-xs bg-muted px-1 rounded">
                pkg:&lt;type&gt;/&lt;namespace&gt;/&lt;name&gt;
              </code>
              {" (e.g., "}
              <code className="text-xs bg-muted px-1 rounded">
                pkg:npm/express
              </code>
              {", "}
              <code className="text-xs bg-muted px-1 rounded">
                pkg:maven/org.apache/commons
              </code>
              {"). Any Qualifiers can be added straight to the artifact name."}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {!purlValidation.isValid && (
        <Alert variant={"default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{purlValidation.warning}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>SBOM Sources/ Origins</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ url: "" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add SBOM URL
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No upstream URLs added yet. Click &quot;Add URL&quot; to add one.
          </p>
        )}

        <Callout intent={"info"} showIcon>
          <span className="text-sm flex items-center">
            To manage SBOMs inside your repository effectively, you can have
            several artifacts. For each artifact, there can be various SBOM
            sources or sometimes called origins (set during SBOM upload). You
            can add external SBOM URLs here to have DevGuard periodically fetch
            and sync SBOMs from these locations. External SBOMs are added as
            SBOM source/ origin to one artifact. The SBOM URL must be publicly
            reachable.
          </span>
        </Callout>

        {fields.map((field, index) => {
          return (
            <div key={field.id} className="space-y-1 pl-3">
              <div className="flex items-start space-x-2">
                <div className="flex-1 flex-col flex">
                  <FormField
                    control={form.control}
                    name={`informationSources.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter upstream URL (e.g., https://example.com/sbom.json)"
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
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ArtifactForm;
