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

interface OrgFormProps {
  forceVertical?: boolean;
}

export const OrgForm: FunctionComponent<OrgFormProps> = ({
  forceVertical = true,
}) => (
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
            /[a-z0-9]/i.test(value ?? "") ||
            "The name must contain at least one letter or number.",
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization name*</FormLabel>
            <FormControl>
              <Input data-testid="org-name-label" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </Section>
);
