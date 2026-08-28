// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/types/auth";
import { getUserFullName } from "@/utils/auth";

export default function LoggedInAs({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {getUserFullName(user)
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-left text-muted-foreground">
        {getUserFullName(user)}
        <br />
        {user.traits.email ? user.traits.email : "No email"}
      </span>
    </div>
  );
}
