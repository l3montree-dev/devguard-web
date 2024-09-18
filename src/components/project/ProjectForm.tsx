import { ProjectDTO } from "@/types/api/api";
import { FunctionComponent } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import Section from "../common/Section";
import ListItem from "../common/ListItem";
import { Switch } from "../ui/switch";
import { classNames } from "@/utils/common";

interface Props {
  form: UseFormReturn<ProjectDTO, any, undefined>;
  forceVerticalSections: boolean;
}

export const ProjectForm: FunctionComponent<Props> = ({
  form,
  forceVerticalSections,
}) => {
  const org = useActiveOrg();
  return (
    <>
      <Section
        forceVertical={forceVerticalSections}
        description="General Settings of the project"
        title="General"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>The name of the project.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>The description of the project.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </Section>
      <hr />
      <Section
        forceVertical={forceVerticalSections}
        description="Should this organization be made visible to the public? The organization can be accessed without any authentication."
        title="Visibility"
      >
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem>
              <div className={classNames(!org.isPublic && "opacity-50")}>
                <ListItem
                  description={
                    "Setting this to true will make the project visible to the public. It allows creating public and private assets."
                  }
                  Title="Public Project"
                  Button={
                    <FormControl>
                      <Switch
                        disabled={!org.isPublic}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  }
                />
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        {!org.isPublic && (
          <small>
            The organization is not public. You can not make the project public.
          </small>
        )}
      </Section>
    </>
  );
};
