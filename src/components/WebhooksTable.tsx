// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Alert from "@/components/common/Alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type { WebhookDTO } from "@/types/api/api";
import { classNames } from "@/utils/common";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, type FunctionComponent } from "react";
import { WebhookIntegrationDialog } from "./common/WebhookIntegrationDialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Props {
  webhooks: WebhookDTO[];
  // API base of these webhooks, e.g. /organizations/o/integrations/webhook
  urlBase: string;
  onUpdateWebhook: (integration: WebhookDTO) => void;
  onDeleted: (id: string) => void;
  projectWebhook: boolean;
  isLoading?: boolean;
}

const COLUMNS = ["Name", "URL", "Sends", "Actions"];

const triggerEvents = (webhook: WebhookDTO) =>
  [webhook.sbomEnabled && "SBOM", webhook.vulnEnabled && "Vulnerabilities"]
    .filter(Boolean)
    .join(", ");

const WebhooksTable: FunctionComponent<Props> = ({
  webhooks,
  urlBase,
  onUpdateWebhook,
  onDeleted,
  projectWebhook,
  isLoading,
}) => {
  const [editing, setEditing] = useState<WebhookDTO | null>(null);

  const deleteWebhook = async (id: string) => {
    const res = await browserApiClient(urlBase + "/" + id, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Failed to delete webhook");
      return;
    }

    toast.success("Webhook deleted successfully");
    onDeleted(id);
  };

  return (
    <>
      <div
        className="overflow-hidden rounded-lg border shadow-sm"
        data-testid="webhooks-section"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-card text-foreground">
              <tr>
                {COLUMNS.map((column, i) => (
                  <th
                    key={column}
                    className={classNames(
                      "whitespace-nowrap p-4 text-left font-medium",
                      i === COLUMNS.length - 1 && "w-px text-right",
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-foreground">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, row) => (
                  <tr
                    key={row}
                    className={classNames(
                      "border-b last:border-0",
                      row % 2 !== 0 && "bg-card/75",
                    )}
                  >
                    {COLUMNS.map((_column, cell) => (
                      <td key={cell} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : webhooks.length === 0 ? (
                <tr>
                  <td
                    className="p-4 text-muted-foreground"
                    colSpan={COLUMNS.length}
                  >
                    No webhooks configured yet.
                  </td>
                </tr>
              ) : (
                webhooks.map((webhook, i) => (
                  <tr
                    key={webhook.id}
                    className={classNames(
                      "border-b last:border-0",
                      i % 2 !== 0 && "bg-card/75",
                    )}
                  >
                    <td className="p-4">
                      <span className="block">{webhook.name}</span>
                      {Boolean(webhook.description) && (
                        <span className="block text-xs text-muted-foreground">
                          {webhook.description}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs">{webhook.url}</td>
                    <td className="whitespace-nowrap p-4">
                      {triggerEvents(webhook) || (
                        <span className="text-muted-foreground">Nothing</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid="webhook-actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            data-testid="edit-webhook-button"
                            onClick={() => setEditing(webhook)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <Alert
                            onConfirm={() => deleteWebhook(webhook.id)}
                            title="Delete webhook"
                            description="DevGuard will stop sending notifications to this URL. This cannot be undone."
                          >
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </Alert>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <WebhookIntegrationDialog
          key={editing.id}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          initialValues={editing}
          onNewIntegration={onUpdateWebhook}
          onDeleteWebhook={async (id) => {
            await deleteWebhook(id);
            setEditing(null);
          }}
          projectWebhook={projectWebhook}
        />
      )}
    </>
  );
};

export default WebhooksTable;
