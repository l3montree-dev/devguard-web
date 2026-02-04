// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { FunctionComponent } from "react";
import { UseFormReturn } from "react-hook-form";
import { AssetFormValues } from "../AssetForm";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ListItem from "@/components/common/ListItem";

interface Props {
  form: UseFormReturn<AssetFormValues, any, AssetFormValues>;
}

export const VulnAutoReopenAfterDays: FunctionComponent<Props> = ({ form }) => {
  const vulnAutoReopenAfterDays = form.watch("vulnAutoReopenAfterDays");
  const isEnabled =
    vulnAutoReopenAfterDays !== undefined &&
    vulnAutoReopenAfterDays !== null &&
    vulnAutoReopenAfterDays > 0;

  return (
    <FormField
      control={form.control}
      name="vulnAutoReopenAfterDays"
      render={({ field }) => (
        <FormItem>
          <ListItem
            Description={
              <>
                Automatically reopen accepted vulnerabilities after a specified
                time period. PCI-DSS requires vulnerabilities to be revalidated
                after 6 months, so this may be a good default.
                {isEnabled && (
                  <div className="mt-4">
                    <Select
                      onValueChange={(value) => {
                        form.setValue(
                          "vulnAutoReopenAfterDays",
                          parseInt(value, 10),
                          { shouldDirty: true },
                        );
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="text-foreground">
                          <SelectValue placeholder="Select a time range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="60">2 Months</SelectItem>
                        <SelectItem value="120">4 Months</SelectItem>
                        <SelectItem value="180">6 Months</SelectItem>
                        <SelectItem value="360">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            }
            Title="Auto-reopen vulnerabilities"
            Button={
              <FormControl>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(v) => {
                    if (v) {
                      form.setValue("vulnAutoReopenAfterDays", 180, {
                        shouldDirty: true,
                      });
                    } else {
                      form.setValue("vulnAutoReopenAfterDays", null, {
                        shouldDirty: true,
                      });
                    }
                  }}
                />
              </FormControl>
            }
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
