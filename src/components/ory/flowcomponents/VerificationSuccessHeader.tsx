// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { CircleCheck } from "lucide-react";

export function VerificationSuccessHeader() {
  return (
    <header className="flex flex-col items-center gap-2 antialiased">
      <CircleCheck className="h-10 w-10 text-success" />
      <h2 className="text-lg font-semibold">Email verified</h2>
      <p className="text-muted-foreground">
        Your email address has been verified successfully.
      </p>
    </header>
  );
}
