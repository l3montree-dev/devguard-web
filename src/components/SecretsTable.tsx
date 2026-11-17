// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import Alert from "@/components/common/Alert";
import Section from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSecrets } from "@/hooks/useSecrets";
import { toast } from "@/lib/toast";
import type { ConfigScope } from "@/services/configFileService";
import { deleteSecret } from "@/services/secretService";
import type { SecretDTO } from "@/types/dto";
import { classNames } from "@/utils/common";
import { LockIcon, Trash2 } from "lucide-react";
import type { FunctionComponent } from "react";
import NewSecretDialog from "./NewSecretDialog";

interface Props {
  scope: ConfigScope;
}

const scopeLabel: Record<SecretDTO["scope"], string> = {
  organization: "Organization",
  project: "Project",
  asset: "Repository",
};

const SecretsTable: FunctionComponent<Props> = ({ scope }) => {
  const { data: secrets = [], isLoading, mutate } = useSecrets(scope);

  const handleDelete = async (id: string) => {
    try {
      await deleteSecret(scope, id);
    } catch {
      toast.error("Failed to delete secret");
      return;
    }

    toast.success("Secret deleted");
    mutate();
  };

  return (
    <Section
      title={`${scopeLabel[scope.level]} secrets`}
      description="Secrets are stored encrypted and can only be referenced, never read again. Secrets of the parent organization and project are inherited."
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
                <th className="w-px p-4" />
              </tr>
            </thead>
            <tbody className="text-foreground">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, row) => (
                  <tr key={row} className="border-b last:border-0">
                    <td className="p-4" colSpan={2}>
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : secrets.length === 0 ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={2}>
                    No secrets configured yet.
                  </td>
                </tr>
              ) : (
                secrets.map((secret, i) => (
                  <tr
                    key={secret.id}
                    className={classNames(
                      "border-b last:border-0",
                      i % 2 !== 0 && "bg-card/75",
                    )}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <LockIcon className="h-4 w-4 text-muted-foreground" />
                        <span
                          className={classNames(
                            "font-mono",
                            secret.overridden &&
                              "text-muted-foreground line-through",
                          )}
                        >
                          {secret.name}
                        </span>
                        {secret.inherited && (
                          <Badge variant="secondary">
                            Inherited from {secret.inheritedFrom}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {!secret.inherited && (
                        <Alert
                          onConfirm={() => handleDelete(secret.id)}
                          title="Delete secret"
                          description={`Configurations referencing $${secret.name} will no longer be able to use it. This cannot be undone.`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete ${secret.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Alert>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <NewSecretDialog
          scope={scope}
          onCreated={() => mutate()}
          Trigger={<Button>New secret</Button>}
        />
      </div>
    </Section>
  );
};

export default SecretsTable;
