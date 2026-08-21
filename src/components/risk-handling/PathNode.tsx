// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Purl from "@/components/common/Purl";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { FunctionComponent } from "react";

import type { PathNodeRole } from "@/types/view/riskHandling";

const roleDescription: Record<PathNodeRole, string> = {
  root: "Your application",
  dependency: "Dependency",
  vulnerable: "Vulnerable",
};

interface PathNodeProps {
  // Either a purl (dependency / vulnerable) or the application name (root).
  label: string;
  role: PathNodeRole;
  // False for roots grouped inside the shared cluster box - the cluster
  // already draws the border, so each entry inside it stays borderless.
  bordered?: boolean;
}

const PathNode: FunctionComponent<PathNodeProps> = ({
  label,
  role,
  bordered = true,
}) => {
  const isVulnerable = role === "vulnerable";

  return (
    <Item
      variant={bordered ? "outline" : "default"}
      size="sm"
      className={cn(
        // "max-w-[20rem]",
        bordered &&
          (isVulnerable
            ? "border-destructive/40"
            : "border-muted-foreground/40"),
      )}
    >
      <ItemContent>
        <ItemTitle>
          <Purl purl={label} showQualifiers={false} />
        </ItemTitle>
        <ItemDescription className={cn(isVulnerable && "text-destructive/80")}>
          {roleDescription[role]}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};

export default PathNode;
