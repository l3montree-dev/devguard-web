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

export const InvitationForm: FunctionComponent<OrgFormProps> = ({
  forceVertical = true,
}) => (
  <Section
    description="Enter the invitation link of the organization."
    title="General Information"
    forceVertical={forceVertical}
  >
    <div className="mt-6">
      <FormField
        name="invitation-url"
        rules={{
          validate: (value) =>
            // Allows every character as long as one letter or number is given.
            /[a-z0-9]/i.test(value ?? "") || "The invitation can not be empty.",
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization invitation url/code*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </Section>
);
