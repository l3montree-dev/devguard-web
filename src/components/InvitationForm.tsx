import type { FunctionComponent } from "react";
import Section from "./common/Section";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";
import { Input } from "./ui/input";

interface OrgFormProps {
  forceVertical?: boolean;
}

export const InvitationForm: FunctionComponent<OrgFormProps> = ({
  forceVertical = true,
}) => (
  <Section
    description="Enter the invitationlink of the organization. This will be used to let you access your organization in the system."
    title="General Information"
    forceVertical={forceVertical}
  >
    <div className="mt-6">
      <FormField
        name="invitation-url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization invitation url/code*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  </Section>
);
