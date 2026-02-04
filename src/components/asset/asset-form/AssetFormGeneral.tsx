// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { AsyncButton, Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { classNames } from "@/utils/common";
import Image from "next/image";
import { FunctionComponent } from "react";
import { UseFormReturn } from "react-hook-form";
import { AssetFormValues, createUpdateHandler } from "../AssetForm";

interface Props {
  form: UseFormReturn<AssetFormValues, any, AssetFormValues>;
  disable?: boolean;
  onUpdate?: (values: Partial<AssetFormValues>) => Promise<void>;
}

export const AssetFormGeneral: FunctionComponent<Props> = ({
  form,
  disable,
  onUpdate: handleUpdate,
}) => {
  const gitInstance = form.watch("repositoryProvider");
  const externalEntityProviderId = form.watch("externalEntityProviderId");
  return (
    <>
      <FormField
        name="name"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input disabled={disable} required={true} {...field} />
            </FormControl>
            <FormDescription>The name of the repository.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="description"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input disabled={disable} {...field} />
            </FormControl>
            <FormDescription>
              The description of the repository.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      {!externalEntityProviderId && (
        <>
          <Label className="mt-4">
            Which Repository provider are you using?
          </Label>

          <div className="flex gap-2 w-full">
            <Button
              variant={"secondary"}
              type="button"
              className={classNames(
                "w-full",
                gitInstance === "github" && "border !border-primary",
              )}
              onClick={() => {
                form.setValue("repositoryProvider", "github", {
                  shouldDirty: true,
                });
              }}
            >
              <Image
                src="/assets/github.svg"
                alt="GitHub Logo"
                className="mr-2 dark:invert"
                width={24}
                height={24}
              />
              GitHub
            </Button>
            <Button
              variant={"secondary"}
              type="button"
              className={classNames(
                "w-full border",
                gitInstance === "gitlab" && "!border-primary",
              )}
              onClick={() => {
                form.setValue("repositoryProvider", "gitlab", {
                  shouldDirty: true,
                });
              }}
            >
              <Image
                src="/assets/gitlab.svg"
                alt="GitHub Logo"
                className="mr-2"
                width={24}
                height={24}
              />
              Gitlab
            </Button>
          </div>
        </>
      )}
      {handleUpdate && (
        <div className="mt-4 flex flex-row justify-end">
          <AsyncButton
            type="button"
            disabled={
              !(
                form.formState.dirtyFields?.name ||
                form.formState.dirtyFields?.description ||
                form.formState.dirtyFields?.repositoryProvider
              )
            }
            onClick={createUpdateHandler(
              form,
              ["name", "description", "repositoryProvider"],
              handleUpdate,
            )}
          >
            Save
          </AsyncButton>
        </div>
      )}
    </>
  );
};
