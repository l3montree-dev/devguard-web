// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useActiveOrg } from "@/hooks/useActiveOrg";
import type { ProjectDTO } from "@/types/api/api";
import { classNames } from "@/utils/common";
import type { FunctionComponent } from "react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import Alert from "../common/Alert";
import DangerZone from "../common/DangerZone";
import ListItem from "../common/ListItem";
import Section from "../common/Section";
import { Button } from "../ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Switch } from "../ui/switch";

interface Props {
  form: UseFormReturn<ProjectDTO, any, ProjectDTO>;
  forceVerticalSections: boolean;
  onUpdate?: (data: Partial<ProjectDTO>) => Promise<boolean>;
  onConfirmDelete?: () => Promise<void>;
}

export const ProjectDangerZone: FunctionComponent<Props> = ({
  form,
  forceVerticalSections,
  onUpdate,
  onConfirmDelete,
}) => {
  const org = useActiveOrg();
  const [isSaving, setIsSaving] = useState(false);
  return (
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
                        data-testid="public-group-switch"
                        disabled={!org.isPublic || isSaving}
                        checked={field.value}
                        onCheckedChange={async (checked) => {
                          field.onChange(checked);
                          setIsSaving(true);
                          const ok = await onUpdate?.({ isPublic: checked });
                          // the save failed, so put the switch back where it was
                          if (ok === false) {
                            field.onChange(!checked);
                          }
                          setIsSaving(false);
                        }}
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
            The organization is not public. You can not make the group public.
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
  );
};
