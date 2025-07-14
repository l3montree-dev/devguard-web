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
import DangerZone from "../common/DangerZone";

import Alert from "../common/Alert";
import { Button } from "../ui/button";

interface Props {
  form: UseFormReturn<ProjectDTO, any, ProjectDTO>;
  forceVerticalSections: boolean;
  disabled?: boolean;
  onConfirmDelete?: () => Promise<void>;
  hideDangerZone?: boolean;
}

export const ProjectForm: FunctionComponent<Props> = ({
  form,
  disabled,
  forceVerticalSections,
  onConfirmDelete,
  hideDangerZone = false,
}) => {
  const org = useActiveOrg();
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
                <Input disabled={disabled} required={true} {...field} />
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
                <Input disabled={disabled} {...field} />
              </FormControl>
              <FormDescription>The description of the group.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </Section>
      {!hideDangerZone && (
        <>
          <hr />
          <DangerZone>
            <Section
              className="pb-0"
              forceVertical={forceVerticalSections}
              title="Advanced"
              description="These settings are for advanced users only. Please be careful when changing these settings."
            >
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <div className={classNames(!org.isPublic && "opacity-50")}>
                      <ListItem
                        Description={
                          "Setting this to true will make the group visible to the public. It allows creating public and private assets."
                        }
                        Title="Public Group"
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
                  The organization is not public. You can not make the group
                  public.
                </small>
              )}
              {onConfirmDelete && (
                <ListItem
                  Title="Delete Group"
                  Description={
                    "This will delete the group and all of its data. This action cannot be undone."
                  }
                  Button={
                    <Alert
                      title="Are you sure to delete this group?"
                      description="This action cannot be undone. All data associated with this repository will be deleted."
                      onConfirm={onConfirmDelete}
                    >
                      <Button variant={"destructive"}>Delete</Button>
                    </Alert>
                  }
                />
              )}
            </Section>
          </DangerZone>
        </>
      )}
    </>
  );
};
