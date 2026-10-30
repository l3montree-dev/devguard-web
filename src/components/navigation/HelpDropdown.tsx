// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
"use client";

import { useConfig } from "@/context/ConfigContext";
import { useTourContext } from "@/context/TourContext";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useIsSelfHosted } from "@/hooks/useIsSelfHosted";
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
  const { enterpriseUrl } = useConfig();
  const isSelfHosted = useIsSelfHosted();
  const slug = activeOrg?.slug ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-umami-event="Help Dropdown"
        aria-label="Open help menu"
      >
        <div className="flex w-10 flex-row justify-center">
          <MessageCircleQuestionMark
            data-tour="help-center"
            className="h-[1.2rem] w-[1.2rem] cursor-pointer text-header-foreground transition-all"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link
          className="hover:bg-transparent hover:no-underline !text-foreground"
          href={`/${slug}/help-center`}
        >
          <DropdownMenuItem
            data-umami-event="Help Center"
            className="hover:bg-transparent hover:no-underline !text-foreground flex items-center cursor-pointer gap-2"
          >
            Help Center
          </DropdownMenuItem>
        </Link>
        {hasSteps && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-umami-event="Guided Tour"
              className="flex items-center gap-2 cursor-pointer"
              onClick={openTour}
            >
              Guided Tour
            </DropdownMenuItem>
          </>
        )}
        {isSelfHosted && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              data-umami-event="Enterprise"
              className="flex items-center gap-2 cursor-pointer !text-foreground hover:no-underline"
            >
              <a href={enterpriseUrl} target="_blank" rel="noopener noreferrer">
                Enterprise
              </a>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
