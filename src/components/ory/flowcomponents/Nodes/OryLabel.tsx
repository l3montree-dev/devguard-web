// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import type { OryNodeLabelProps } from "@ory/elements-react";
import { Label } from "@/components/ui/label";

export function OryLabel({
  node,
  attributes,
  children,
  ...rest
}: OryNodeLabelProps) {
  return (
    <Label htmlFor={attributes.name} {...rest}>
      {children ?? node.meta.label?.text}
    </Label>
  );
}
