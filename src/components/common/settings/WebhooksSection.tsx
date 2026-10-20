// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Section from "@/components/common/Section";
import { WebhookIntegrationDialog } from "@/components/common/WebhookIntegrationDialog";
import { Button } from "@/components/ui/button";
import WebhooksTable from "@/components/WebhooksTable";
import { useWebhooks } from "@/hooks/useWebhooks";
import type { WebhookScope } from "@/services/webhookService";
import type { WebhookDTO } from "@/types/dto";

const WebhooksSection = ({ scope }: { scope: WebhookScope }) => {
  const { webhooks, webhooksLoading, mutateWebhooks } = useWebhooks(scope);
  const projectWebhook = scope.level === "project";

  const handleCreated = (webhook: WebhookDTO) =>
    mutateWebhooks((prev) => (prev ?? []).concat(webhook), {
      revalidate: false,
    });

  const handleUpdated = (webhook: WebhookDTO) =>
    mutateWebhooks(
      (prev) => (prev ?? []).map((w) => (w.id === webhook.id ? webhook : w)),
      { revalidate: false },
    );

  const handleDeleted = (id: string) =>
    mutateWebhooks((prev) => (prev ?? []).filter((w) => w.id !== id), {
      revalidate: false,
    });

  return (
    <Section
      forceVertical
      primaryHeadline
      title="Webhooks"
      description="Manage the webhooks that are used to connect DevGuard with your Applications."
    >
      <WebhooksTable
        webhooks={webhooks}
        scope={scope}
        onUpdateWebhook={handleUpdated}
        onDeleted={handleDeleted}
        projectWebhook={projectWebhook}
        isLoading={webhooksLoading}
      />
      <div className="flex flex-row justify-end">
        <WebhookIntegrationDialog
          onNewIntegration={handleCreated}
          Button={<Button>Add Webhook</Button>}
          projectWebhook={projectWebhook}
        />
      </div>
    </Section>
  );
};

export default WebhooksSection;
