// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import type { OryNodeImageProps } from "@ory/elements-react";

export function OryImage({ node, attributes }: OryNodeImageProps) {
  return (
    <img
      src={attributes.src}
      alt={node.meta.label?.text ?? ""}
      width={attributes.width}
      height={attributes.height}
      className="rounded-md"
    />
  );
}
