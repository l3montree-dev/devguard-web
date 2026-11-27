// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import type { OryNodeAnchorProps } from "@ory/elements-react";
import { Button } from "@/components/ui/button";

export function OryAnchor({ attributes, node }: OryNodeAnchorProps) {
  return (
    <Button asChild className="ory-button-link text-primary-foreground!">
      <a href={attributes.href} id={attributes.id}>
        {node.meta.label?.text ?? attributes.title.text}
      </a>
    </Button>
  );
}
