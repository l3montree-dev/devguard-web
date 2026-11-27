// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useIsEmailUnverified } from "@/hooks/useIsEmailUnverified";

const EmailVerificationBanner = () => {
  const isEmailUnverified = useIsEmailUnverified();

  return isEmailUnverified ? (
    <div className="flex items-center justify-center gap-2 border-b border-warning-border bg-warning-muted px-4 py-1 text-xs text-warning">
      <TriangleAlert className="h-3.5 w-3.5" />
      Your email address is not verified.
      <Link className="font-medium underline" href="/verification">
        Verify now
      </Link>
    </div>
  ) : null;
};

export default EmailVerificationBanner;
