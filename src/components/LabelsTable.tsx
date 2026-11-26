// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import Alert from "@/components/common/Alert";
import Section from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useLabels } from "@/hooks/useLabels";
import { toast } from "@/lib/toast";
import type { ConfigScope } from "@/services/configFileService";
import { deleteLabel, inheritedFrom } from "@/services/labelService";
import { classNames } from "@/utils/common";
import { Edit, Trash2 } from "lucide-react";
import type { FunctionComponent } from "react";
import NewLabelDialog from "./NewLabelDialog";

interface Props {
  scope: ConfigScope;
}

const scopeLabel: Record<ConfigScope["level"], string> = {
  organization: "Organization",
  project: "Project",
  asset: "Repository",
};

// black or white text depending on background color
const textColorFor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? "#000000" : "#ffffff";
};

const LabelsTable: FunctionComponent<Props> = ({ scope }) => {
  const { data: labels = [], isLoading, mutate } = useLabels(scope);

  const org = useActiveOrg();
  const project = useActiveProject();

  const handleDelete = async (id: string) => {
    try {
      await deleteLabel(scope, id);
    } catch {
      toast.error("Failed to delete label");
      return;
    }

    toast.success("Label deleted");
    mutate();
  };

  return (
    <Section
      title={`${scopeLabel[scope.level]} labels`}
      description="Labels can be attached to artifacts. Labels of the parent organization and project are inherited."
      forceVertical
      primaryHeadline
    >
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-card text-foreground">
              <tr>
                <th className="whitespace-nowrap p-4 text-left font-medium">
                  Name
                </th>
                <th className="whitespace-nowrap p-4 text-left font-medium">
                  Description
                </th>
                <th className="w-px p-4" />
                <th className="w-px p-4" />
              </tr>
            </thead>
            <tbody className="text-foreground">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, row) => (
                  <tr key={row} className="border-b last:border-0">
                    <td className="p-4" colSpan={3}>
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : labels.length === 0 ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={3}>
                    No labels configured yet.
                  </td>
                </tr>
              ) : (
                labels.map((label, i) => {
                  const inherited = inheritedFrom(label, scope);
                  return (
                    <tr
                      key={label.id}
                      className={classNames(
                        "border-b last:border-0",
                        i % 2 !== 0 && "bg-card/75",
                      )}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Badge
                            className="border-transparent"
                            style={{
                              backgroundColor: label.backgroundColor,
                              color: textColorFor(label.backgroundColor),
                            }}
                          >
                            {label.label}
                          </Badge>
                          {inherited && (
                            <Badge variant="secondary">
                              Inherited from{" "}
                              {inherited === "organization"
                                ? org.name
                                : project.name}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 px-2 text-muted-foreground">
                        {label.description}
                      </td>
                      <td className="py-4 text-right">
                        {!inherited && (
                          <NewLabelDialog
                            scope={scope}
                            label={label}
                            onSuccess={() => mutate()}
                            Trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={`Edit ${label.label}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        {!inherited && (
                          <Alert
                            onConfirm={() => handleDelete(label.id)}
                            title="Delete label"
                            description={`The label ${label.label} will be removed from all artifacts. This cannot be undone.`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Delete ${label.label}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Alert>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <NewLabelDialog
          scope={scope}
          onSuccess={() => mutate()}
          Trigger={<Button>Add label</Button>}
        />
      </div>
    </Section>
  );
};

export default LabelsTable;
