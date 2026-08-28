// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useComplianceComponentsForControl } from "@/hooks/useCompliancePosture";
import { AsyncButton } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import type { PostureScope } from "@/services/compliancePostureService";
import { createStatement } from "@/services/compliancePostureService";
import type { ImplementationStatus } from "@/types/view/compliance";
import type { ComplianceComponentImplementsControlStatementDTO } from "@/types/dto";
import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ComplianceComponentIcon from "./ComplianceComponentIcon";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  { ssr: false },
);

const IMPLEMENTATION_STATUSES: {
  value: ImplementationStatus;
  label: string;
}[] = [
  { value: "implemented", label: "Implemented" },
  { value: "partial", label: "Partial" },
  { value: "planned", label: "Planned" },
  { value: "alternative", label: "Alternative" },
  { value: "notApplicable", label: "Not Applicable" },
];

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  scope: PostureScope;
  frameworkControlId: string;
  attachedComponentIds: string[];
  onCreated: (
    statement: ComplianceComponentImplementsControlStatementDTO,
  ) => void;
}

const AddComplianceComponentStatementDialog: FunctionComponent<Props> = ({
  open,
  setOpen,
  scope,
  frameworkControlId,
  attachedComponentIds,
  onCreated,
}) => {
  const { data: allComponents } = useComplianceComponentsForControl(
    open ? frameworkControlId : undefined,
  );

  const components = useMemo(
    () => allComponents?.filter((c) => !attachedComponentIds.includes(c.uuid)),
    [allComponents, attachedComponentIds],
  );

  const [componentId, setComponentId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<ImplementationStatus | undefined>(
    undefined,
  );
  const [description, setDescription] = useState("");

  const selectedComponent = useMemo(
    () => components?.find((c) => c.uuid === componentId),
    [components, componentId],
  );

  const implementsControlDescription = useMemo(
    () =>
      selectedComponent?.implementedControls.find(
        (ic) => ic.frameworkControlId === frameworkControlId,
      )?.description,
    [selectedComponent, frameworkControlId],
  );

  const reset = () => {
    setComponentId(undefined);
    setStatus(undefined);
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!componentId || !status) {
      toast("Please select a component and an implementation status.");
      return;
    }

    let json: ComplianceComponentImplementsControlStatementDTO;
    try {
      json = (await createStatement(scope, frameworkControlId, componentId, {
        implementationStatus: status,
        description,
      })) as ComplianceComponentImplementsControlStatementDTO;
    } catch {
      toast.error("Failed to attach component", {
        description: "Please try again later.",
      });
      return;
    }

    toast.success("Component attached");
    reset();
    setOpen(false);
    onCreated(json);
  };

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>Attach a Component</DialogTitle>
          <DialogDescription>
            Record that a component you are using implements this control, and
            at what status.
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Component
            </label>
            <Select value={componentId} onValueChange={setComponentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a component..." />
              </SelectTrigger>
              <SelectContent>
                {(components ?? []).map((c) => (
                  <SelectItem key={c.uuid} value={c.uuid}>
                    <span className="flex flex-row items-center gap-2">
                      <ComplianceComponentIcon title={c.title} size="sm" />
                      {c.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {components?.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {allComponents?.length
                  ? "All components claiming to implement this control are already attached."
                  : "No components claim to implement this control yet."}
              </p>
            )}
          </div>
          {implementsControlDescription && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs font-semibold text-muted-foreground">
                How {selectedComponent?.title} implements this control
              </p>
              <p className="mt-1 text-sm">{implementsControlDescription}</p>
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Implementation Status
            </label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ImplementationStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a status..." />
              </SelectTrigger>
              <SelectContent>
                {IMPLEMENTATION_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Description
            </label>
            <MarkdownEditor
              placeholder="How is this component configured to implement the control?"
              value={description}
              setValue={(v) => setDescription(v ?? "")}
            />
          </div>
        </div>
        <DialogFooter>
          <AsyncButton onClick={handleSubmit}>Attach</AsyncButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddComplianceComponentStatementDialog;
