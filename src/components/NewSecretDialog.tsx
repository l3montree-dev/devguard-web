// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { toast } from "@/lib/toast";
import { ApiError } from "@/services/apiClient";
import type { ConfigScope } from "@/services/configFileService";
import type { SecretCreateRequest } from "@/services/secretService";
import { createSecret } from "@/services/secretService";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { PasswordField } from "./common/PasswordField";

interface Props {
  scope: ConfigScope;
  Trigger: ReactNode;
  onCreated: () => void;
}

const NewSecretDialog: FunctionComponent<Props> = ({
  scope,
  Trigger,
  onCreated,
}) => {
  const [open, setOpen] = useState(false);
  const form = useForm<SecretCreateRequest>({
    defaultValues: { name: "", value: "" },
  });

  const handleSubmit = async (data: SecretCreateRequest) => {
    try {
      await createSecret(scope, data);
    } catch (e) {
      toast.error(
        e instanceof ApiError && e.status === 409
          ? `A secret named ${data.name} already exists`
          : "Failed to create secret",
      );
      return;
    }

    toast.success("Secret created");
    form.reset();
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New secret</DialogTitle>
          <DialogDescription>
            The value is stored encrypted and cannot be viewed again after
            saving.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="npm_token"
                      required
                      pattern="[a-zA-Z0-9_]+"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Letters, digits and underscores. Reference it as $name in
                    the dependency proxy configuration.
                  </FormDescription>
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="secret-value">Value</Label>
              <PasswordField
                id="secret-value"
                field={form.register("value", { required: true })}
                label="Value"
                autoComplete="off"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Add secret
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSecretDialog;
