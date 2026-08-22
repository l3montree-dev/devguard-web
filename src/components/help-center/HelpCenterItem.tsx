// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import ListItem from "@/components/common/ListItem";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { FunctionComponent } from "react";

interface Props {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
  external?: boolean;
  variant?: "default" | "secondary";
}

const HelpCenterItem: FunctionComponent<Props> = ({
  Icon,
  title,
  description,
  actionLabel,
  href,
  external,
  variant = "secondary",
}) => (
  <ListItem
    Title={
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </div>
    }
    Description={description}
    Button={
      href ? (
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={cn(
            buttonVariants({ variant }),
            variant === "default" && "text-primary-foreground!",
          )}
        >
          {actionLabel}
        </Link>
      ) : (
        <Button variant={variant} disabled>
          {actionLabel}
        </Button>
      )
    }
  />
);

export default HelpCenterItem;
