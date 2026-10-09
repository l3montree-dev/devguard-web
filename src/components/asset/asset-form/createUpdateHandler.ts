// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { UseFormReturn } from "react-hook-form";
import type { AssetFormValues } from "@/types/view/asset";

export const createUpdateHandler = <T extends keyof AssetFormValues>(
  form: UseFormReturn<AssetFormValues, any, AssetFormValues>,
  fields: T[],
  onUpdate: (values: Partial<AssetFormValues>) => Promise<void>,
) => {
  return async () => {
    const values: Partial<AssetFormValues> = {};
    const dirtyFields = form.formState.dirtyFields;

    fields.forEach((field) => {
      if (dirtyFields?.[field]) {
        values[field] = form.getValues(field);
      }
      if (
        field === "cvssAutomaticTicketThreshold" ||
        field === "riskAutomaticTicketThreshold"
      ) {
        values["enableTicketRange"] = form.getValues("enableTicketRange");
        values["cvssAutomaticTicketThreshold"] = form.getValues(
          "cvssAutomaticTicketThreshold",
        );
        values["riskAutomaticTicketThreshold"] = form.getValues(
          "riskAutomaticTicketThreshold",
        );
      }
    });

    try {
      await onUpdate(values);

      fields.forEach((field) => {
        if (dirtyFields?.[field]) {
          form.resetField(field, { defaultValue: values[field] } as any);
        }
      });
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  };
};
