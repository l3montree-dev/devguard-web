// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { useLoader } from "@/hooks/useLoader";
import { saveRedmineIntegration } from "@/services/organizationService";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { toast } from "@/lib/toast";
import type { RedmineIntegrationDTO } from "@/types/dto";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import React from "react";
import { urlToBaseURL } from "@/utils/url";

export interface RedmineIntegrationFormProps {
  onNewIntegration: (integration: RedmineIntegrationDTO) => void;
  additionalOnClick?: () => void;
  backButtonClick?: () => void;
}

export default function RedmineIntegrationForm({
  onNewIntegration,
  additionalOnClick,
  backButtonClick,
}: RedmineIntegrationFormProps) {
  const form = useForm<{
    url: string;
    token: string;
    name: string;
    tracker: string;
  }>();
  const { Loader, waitFor, isLoading } = useLoader();
  const activeOrg = useActiveOrg();
  const [_open, setOpen] = React.useState(false);

  const handleSubmit = async (params: {
    url: string;
    token: string;
    name: string;
    userEmail: string;
  }) => {
    let integration;
    try {
      integration = await saveRedmineIntegration(activeOrg.slug, {
        ...params,
        url: urlToBaseURL(params.url),
      } as never);
    } catch {
      integration = null;
    }
    if (integration) {
      onNewIntegration(integration);
      setOpen(false);
    } else {
      toast.error("Your Redmine token seems to be wrong");
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          waitFor(form.handleSubmit(handleSubmit))();
          if (additionalOnClick) {
            additionalOnClick();
          }
        }}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="My Redmine Personal Access Token"
                  autoComplete="url"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A name to identify the token later on.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Redmine URL</FormLabel>
              <FormControl>
                <Input
                  placeholder={"https://redmine.example.com"}
                  autoComplete="url"
                  type="url"
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Ensure that you provide the full URL to your Redmine instance,
                including the protocol (https://).
                <br />
                For example: <code>https://redmine.example.com</code>
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Redmine Access-Token</FormLabel>
              <FormControl>
                <Input
                  required
                  autoComplete="off"
                  placeholder="xxxxxxxxxxxxxxx..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                DevGuard uses this token to <strong>create issues</strong> in
                your repository.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tracker"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Redmine Issue Tracker</FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="Bug"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Issue tracker to use for creating issues in Redmine. Either the name or the ID of the tracker can be used.
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="flex flex-row justify-end">
          <div className="flex flex-col items-end justify-end gap-2">
            <div className="flex flex-row gap-4">
              {backButtonClick && (
                <Button variant={"secondary"} onClick={backButtonClick}>
                  Back
                </Button>
              )}
              <Button disabled={isLoading} type="submit">
                <Loader />
                Test and Save
              </Button>
            </div>
            <small className="text-muted-foreground">
              Checks if the provided access token is valid and has at least
              Reporter-Access.
            </small>
          </div>
        </div>
      </form>
    </Form>
  );
}
