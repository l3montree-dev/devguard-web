// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SettingsNavItem {
  title: string;
  segment: string;
  Icon: LucideIcon;
  tour?: string;
  destructive?: boolean;
}

export interface SettingsNavGroup {
  title?: string;
  items: SettingsNavItem[];
}

interface Props {
  base: string;
  groups: SettingsNavGroup[];
  hidden?: string[];
  tour?: string;
}

const SettingsNav = ({ base, groups, hidden, tour }: Props) => {
  const pathname = usePathname();

  return (
    <nav data-tour={tour} className="flex flex-col gap-4">
      {groups.map((group, i) => (
        <div key={group.title ?? i} className="flex flex-col gap-1">
          {group.title !== undefined ? (
            <span className="px-3 text-xs font-medium text-muted-foreground">
              {group.title}
            </span>
          ) : null}
          {group.items
            .filter((item) => !hidden?.includes(item.segment))
            .map(({ title, segment, Icon, tour, destructive }) => {
              const href = segment ? `${base}/${segment}` : base;
              return (
                <Link
                  key={segment}
                  href={href}
                  data-tour={tour}
                  data-testid={`settings-nav-${segment || "general"}`}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "justify-start gap-2",
                    destructive
                      ? "!text-destructive hover:bg-destructive/10"
                      : "!text-foreground",
                    pathname === href &&
                      (destructive ? "bg-destructive/10" : "bg-accent"),
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      destructive
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  />
                  {title}
                </Link>
              );
            })}
        </div>
      ))}
    </nav>
  );
};

export default SettingsNav;
