import type { FunctionComponent } from "react";
import Section from "./common/Section";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input, type InputProps } from "./ui/input";

interface OrgFormProps {
  forceVertical?: boolean;
  title?: string;
  description?: string;
  className?: string;
  inputVariant?: InputProps["variant"];
}

export const InvitationForm: FunctionComponent<OrgFormProps> = ({
  forceVertical = true,
  title = "General Information",
  description = "Enter the invitation link of the organization.",
  className,
  inputVariant,
}) => (
  <Section
    description={description}
    title={title}
    forceVertical={forceVertical}
    className={className}
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
              <Input
                data-testid="join-org-url"
                variant={inputVariant}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </Section>
);
