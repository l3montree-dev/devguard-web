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

interface OrgFormProps {
  autoFocus?: boolean;
  forceVertical?: boolean;
}
export const OrgForm: FunctionComponent<OrgFormProps> = ({
  autoFocus = false,
  forceVertical = true,
}) => {
  const activeOrg = useActiveOrg();
  const orgID = activeOrg?.id;

  return (
    <Section
      description="Enter the name of your organization. This will be used to identify your organization in the system."
      title="General Information"
      forceVertical={forceVertical}
    >
      <div className="mt-6">
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
              <FormLabel>Organization name*</FormLabel>
              <FormControl>
                <Input
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
    </Section>
  );
};
