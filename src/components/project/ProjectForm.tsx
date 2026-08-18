import type { ProjectDTO } from "@/types/api/api";
import type { FunctionComponent } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import Section from "../common/Section";
import { Button } from "../ui/button";

interface Props {
  form: UseFormReturn<ProjectDTO, any, ProjectDTO>;
  forceVerticalSections: boolean;
  disabled?: boolean;
  onUpdate?: (data: Partial<ProjectDTO>) => Promise<boolean>;
}

export const ProjectForm: FunctionComponent<Props> = ({
  form,
  disabled,
  forceVerticalSections,
  onUpdate,
}) => {
  return (
    <>
      <Section
        forceVertical={forceVerticalSections}
        description="General Settings of the group"
        title="General"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  data-testid="group-name"
                  disabled={disabled}
                  required={true}
                  {...field}
                />
              </FormControl>
              <FormDescription>The name of the group.</FormDescription>
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
                <Input
                  data-testid="group-description"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormDescription>The description of the group.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {onUpdate && (
          <div className="mt-4 flex flex-row justify-end">
            <Button isSubmitting={form.formState.isSubmitting} type="submit">
              Update
            </Button>
          </div>
        )}
      </Section>
    </>
  );
};
