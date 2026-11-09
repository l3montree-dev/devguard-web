// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { useLoader } from "@/hooks/useLoader";
import { saveRedmineIntegrationSettings } from "@/services/organizationService";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { toast } from "@/lib/toast";
import type {
  RedmineIntegrationDTO,
  RedminePriorityDTO,
  RedmineStatusDTO,
  RedmineTrackerDTO,
} from "@/types/dto";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useRedmineIntegrationProperties } from "@/hooks/useRedmineIntegrationProperties";
import Loading from "@/app/(loading-group)/user-settings/loading";
import Callout from "./Callout";

export interface RedmineIntegrationSettingsFormProps {
  integration: RedmineIntegrationDTO;
  onSave: (integration: RedmineIntegrationDTO) => void;
  additionalOnClick?: () => void;
  backButtonClick?: () => void;
}

export default function RedmineIntegrationForm({
  integration,
  onSave,
  additionalOnClick,
  backButtonClick,
}: RedmineIntegrationSettingsFormProps) {
  const form = useForm<{
    defaultStatusId: string;
    tracker: string;
    closedStatusId: string;
    mermaidIntegration: string;
    lowPriorityId: string;
    mediumPriorityId: string;
    highPriorityId: string;
    criticalPriorityId: string;
  }>();
  const { Loader, waitFor, isLoading } = useLoader();
  const activeOrg = useActiveOrg();
  const { data: integrationProperties, error: propertyError } =
    useRedmineIntegrationProperties(activeOrg.slug, integration.id);

  const handleSubmit = async (_params: {
    defaultStatusId: string;
    tracker: string;
    closedStatusId: string;
  }) => {
    const trackerId = parseInt(selectedTracker, 10);
    const defaultStatusId =
      selectedDefaultStatus === "none"
        ? null
        : parseInt(selectedDefaultStatus, 10);
    const closeStatusId =
      selectedCloseStatus === "none" ? null : parseInt(selectedCloseStatus, 10);
    const lowPriorityId =
      selectedLowPriority === "none" ? null : parseInt(selectedLowPriority, 10);
    const mediumPriorityId =
      selectedMediumPriority === "none"
        ? null
        : parseInt(selectedMediumPriority, 10);
    const highPriorityId =
      selectedHighPriority === "none"
        ? null
        : parseInt(selectedHighPriority, 10);
    const criticalPriorityId =
      selectedCriticalPriority === "none"
        ? null
        : parseInt(selectedCriticalPriority, 10);

    const body = {
      trackerId,
      defaultStatusId: defaultStatusId,
      closeStatusId: closeStatusId,
      mermaidIntegration: selectedMermaidIntegration as
        "none" | "macro" | "commonmark",
      lowPriorityId,
      mediumPriorityId,
      highPriorityId,
      criticalPriorityId,
    };

    try {
      const response = await saveRedmineIntegrationSettings(
        activeOrg.slug,
        integration.id,
        body,
      );
      onSave(response);
    } catch {
      toast.error("Failed to save Redmine integration settings.");
    }
  };

  const [selectedTracker, setSelectedTracker] = useState(
    integration.trackerId.toString(),
  );
  const [selectedDefaultStatus, setSelectedDefaultStatus] = useState(
    integration.defaultStatusId?.toString() || "none",
  );
  const [selectedCloseStatus, setSelectedClosedStatus] = useState(
    integration.closeStatusId?.toString() || "none",
  );
  const [selectedMermaidIntegration, setSelectedMermaidIntegration] = useState(
    integration.mermaidIntegration || "none",
  );
  const [selectedLowPriority, setSelectedLowPriority] = useState(
    integration.lowPriorityId?.toString() || "none",
  );
  const [selectedMediumPriority, setSelectedMediumPriority] = useState(
    integration.mediumPriorityId?.toString() || "none",
  );
  const [selectedHighPriority, setSelectedHighPriority] = useState(
    integration.highPriorityId?.toString() || "none",
  );
  const [selectedCriticalPriority, setSelectedCriticalPriority] = useState(
    integration.criticalPriorityId?.toString() || "none",
  );

  if (propertyError) {
    return (
      <Callout intent="warning">
        Failed to load Redmine integration properties. Please make sure the
        Redmine integration is properly configured and try again.
      </Callout>
    );
  }

  if (!integrationProperties) {
    return <Loading />;
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          waitFor(form.handleSubmit(handleSubmit))();
          if (additionalOnClick) {
            additionalOnClick();
          }
        }}
      >
        <FormField
          control={form.control}
          name="tracker"
          render={() => (
            <FormItem>
              <FormLabel>Issue Tracker</FormLabel>
              <FormControl>
                <Select
                  value={selectedTracker}
                  onValueChange={setSelectedTracker}
                  required
                >
                  <SelectTrigger data-testid="filter-field-select">
                    <SelectValue placeholder="Select Issue Tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    {integrationProperties.trackers.map(
                      (tracker: RedmineTrackerDTO) => (
                        <SelectItem
                          key={tracker.id}
                          value={tracker.id.toString()}
                        >
                          {tracker.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Select the Redmine issue tracker to use for creating issues.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultStatusId"
          render={() => (
            <FormItem>
              <FormLabel>Default Status</FormLabel>
              <FormControl>
                <Select
                  value={selectedDefaultStatus}
                  onValueChange={setSelectedDefaultStatus}
                >
                  <SelectTrigger data-testid="filter-field-select">
                    <SelectValue placeholder="Select default status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="border-b pb-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          None (use tracker default)
                        </span>
                      </div>
                    </SelectItem>
                    {integrationProperties.statuses.map(
                      (status: RedmineStatusDTO) => (
                        <SelectItem
                          key={status.id}
                          value={status.id.toString()}
                        >
                          {status.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Select the default status for new issues created in Redmine. If
                not set, the default status of the selected tracker will be
                used.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="closedStatusId"
          render={() => (
            <FormItem>
              <FormLabel>Closed Status</FormLabel>
              <FormControl>
                <Select
                  value={selectedCloseStatus}
                  onValueChange={setSelectedClosedStatus}
                  required
                >
                  <SelectTrigger data-testid="filter-field-select">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="border-b pb-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          None (leave issues open)
                        </span>
                      </div>
                    </SelectItem>
                    {integrationProperties.statuses.map(
                      (status: RedmineStatusDTO) => (
                        <SelectItem
                          key={status.id}
                          value={status.id.toString()}
                        >
                          {status.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Select the status that resolved issues should be set to in
                Redmine. If not set, the issue will remain open.
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {priorityDropdown(
            integrationProperties.priorities,
            selectedCriticalPriority,
            setSelectedCriticalPriority,
            "Critical Priority Status",
          )}
          {priorityDropdown(
            integrationProperties.priorities,
            selectedHighPriority,
            setSelectedHighPriority,
            "High Priority Status",
          )}
          {priorityDropdown(
            integrationProperties.priorities,
            selectedMediumPriority,
            setSelectedMediumPriority,
            "Medium Priority Status",
          )}
          {priorityDropdown(
            integrationProperties.priorities,
            selectedLowPriority,
            setSelectedLowPriority,
            "Low Priority Status",
          )}
        </div>
        <FormDescription>
          Select the priority of issues based on the risk level of the finding.
          If not set, the default priority of the selected tracker will be used.
        </FormDescription>

        <FormField
          control={form.control}
          name="mermaidIntegration"
          render={() => (
            <FormItem>
              <FormLabel>Markdown Rendering</FormLabel>
              <FormControl>
                <Select
                  value={selectedMermaidIntegration}
                  onValueChange={setSelectedMermaidIntegration}
                  required
                >
                  <SelectTrigger data-testid="filter-field-select">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="none" value="none">
                      None
                    </SelectItem>
                    <SelectItem key="macro" value="macro">
                      Macro
                    </SelectItem>
                    <SelectItem key="commonmark" value="commonmark">
                      CommonMark
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Redmine does not support Mermaid diagrams natively. If you have
                a plugin installed that supports Mermaid diagrams, you can
                select the rendering method here. Otherwise, you can leave this
                set to &ldquo;None&rdquo; and the Mermaid diagrams will not be
                included in the issue description.
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="flex flex-row justify-end">
          <div className="flex flex-col items-end justify-end gap-2">
            <div className="flex flex-row gap-4">
              {backButtonClick && (
                <Button variant={"secondary"} onClick={backButtonClick}>
                  Back
                </Button>
              )}
              <Button disabled={isLoading} type="submit">
                <Loader />
                Save
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

function priorityDropdown(
  statuses: RedminePriorityDTO[],
  selectedPriority: string,
  setSelectedPriority: (status: string) => void,
  label: string,
) {
  return (
    <FormItem className="mt-4">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Select
          value={selectedPriority}
          onValueChange={setSelectedPriority}
          required
        >
          <SelectTrigger data-testid="filter-field-select">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="none" value="none" className="border-b pb-3 mb-1">
              None (use tracker default)
            </SelectItem>
            {statuses.map((status: RedmineStatusDTO) => (
              <SelectItem key={status.id} value={status.id.toString()}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
    </FormItem>
  );
}
