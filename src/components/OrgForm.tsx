import { FunctionComponent } from "react";
import Section from "./common/Section";
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
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
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization name*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  </Section>
);
