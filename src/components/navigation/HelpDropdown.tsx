// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
"use client";

import { useTourContext } from "@/context/TourContext";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { MessageCircleQuestionMark } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function HelpDropdown() {
  const activeOrg = useActiveOrg();
  const { openTour, hasSteps } = useTourContext();
  const slug = activeOrg?.slug ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Open help menu">
        <div className="flex w-10 flex-row justify-center">
          <MessageCircleQuestionMark className="h-[1.2rem] w-[1.2rem] cursor-pointer dark:text-muted-foreground text-background transition-all" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link
          className="hover:bg-transparent hover:no-underline !text-foreground"
          href={`/${slug}/help-center`}
        >
          <DropdownMenuItem className="hover:bg-transparent hover:no-underline !text-foreground flex items-center cursor-pointer gap-2">
            Help Center
          </DropdownMenuItem>
        </Link>
        {hasSteps && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={openTour}
            >
              Guided Tour
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
