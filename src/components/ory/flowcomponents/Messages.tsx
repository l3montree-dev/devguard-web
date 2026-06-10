// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect } from "react";
import type { OryMessageContentProps } from "@ory/elements-react";
import { toast } from "sonner";

// Track which toast IDs have been shown to prevent duplicates
const shownToastIds = new Set<string | number>();

export function OryToast({
  message,
  id,
}: {
  message: any;
  id: string | number;
}) {
  useEffect(() => {
    // Only show the toast if we haven't shown this ID before
    if (!shownToastIds.has(id)) {
      shownToastIds.add(id);

      const text = typeof message === "string" ? message : message?.text || "";
      const type = typeof message === "object" ? message?.type : "info";

      if (type === "error") {
        toast.error(text);
      } else if (type === "success") {
        toast.success(text);
      } else {
        toast.message(text);
      }
    }
  }, [id, message]);

  return null;
}

const MESSAGE_OVERRIDES: Record<number, string> = {
  4000029: "You must accept the terms of use to use DevGuard",
};

export function OryMessageContent({ message }: OryMessageContentProps) {
  const text = MESSAGE_OVERRIDES[message.id] ?? message.text;
  const colorClass =
    message.type === "error"
      ? "text-destructive"
      : message.type === "success"
        ? "text-success"
        : "text-muted-foreground";

  return <span className={`leading-normal text-sm ${colorClass}`}>{text}</span>;
}
