// Copyright (C) 2026 l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

"use client";

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
import { fetcher } from "@/data-fetcher/fetcher";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type {
  ComplianceComponentDetailsDTO,
  ComplianceComponentImplementsControlStatementDTO,
  ImplementationStatus,
} from "@/types/api/api";
import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
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
  apiBaseUrl: string;
  frameworkControlId: string;
  attachedComponentIds: string[];
  onCreated: (
    statement: ComplianceComponentImplementsControlStatementDTO,
  ) => void;
}

const AddComplianceComponentStatementDialog: FunctionComponent<Props> = ({
  open,
  setOpen,
  apiBaseUrl,
  frameworkControlId,
  attachedComponentIds,
  onCreated,
}) => {
  const { data: allComponents } = useSWR<ComplianceComponentDetailsDTO[]>(
    open
      ? `/compliance-components/?filterQuery[frameworkControlId][is]=${encodeURIComponent(frameworkControlId)}`
      : null,
    fetcher,
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

    const resp = await browserApiClient(
      `${apiBaseUrl}${frameworkControlId}/components/${componentId}/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          implementationStatus: status,
          description,
        }),
      },
    );

    if (!resp.ok) {
      toast.error("Failed to attach component", {
        description: "Please try again later.",
      });
      return;
    }

    const json: ComplianceComponentImplementsControlStatementDTO =
      await resp.json();
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
