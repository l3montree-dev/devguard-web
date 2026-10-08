// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { FunctionComponent } from "react";
import Section from "./common/Section";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { InputWithButton } from "./ui/input-with-button";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import type { Surface } from "@/lib/surface";

interface OrgFormProps {
  autoFocus?: boolean;
  forceVertical?: boolean;
  // the surface the form is rendered on
  variant?: Surface;
  // false renders the fields without the "General Information" section, e.g. inside a step which has its own title
  withSection?: boolean;
}
export const OrgForm: FunctionComponent<OrgFormProps> = ({
  autoFocus = false,
  forceVertical = true,
  variant,
  withSection = true,
}) => {
  const activeOrg = useActiveOrg();
  const orgID = activeOrg?.id;

  const fields = (
    <div className={withSection ? "mt-6" : undefined}>
      <FormField
        name="name"
        rules={{
          validate: (value) =>
            // Allows every character as long as one letter or number is given.
            /[a-z0-9]/i.test(value ?? "") ||
            "The name must contain at least one letter or number.",
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Organization name*</FormLabel>
            <FormControl>
              <Input
                className="mt-1"
                variant={variant}
                autoFocus={autoFocus}
                data-testid="org-name-label"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {activeOrg && (
        <InputWithButton
          label="Organization-ID"
          value={`${orgID}`}
          nameKey="settings-org-id"
          variant="default"
          copyable
          copyToastDescription="The organization ID has been copied to your clipboard."
        />
      )}
    </div>
  );

  if (!withSection) {
    return fields;
  }

  return (
    <Section
      description="Enter the name of your organization. This will be used to identify your organization in the system."
      title="General Information"
      forceVertical={forceVertical}
    >
      {fields}
    </Section>
  );
};
