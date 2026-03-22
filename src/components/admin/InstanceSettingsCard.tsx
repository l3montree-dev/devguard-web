// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { NoSymbolIcon } from "@heroicons/react/20/solid";

export default function InstanceSettingsCard() {
  const [orgCreationDisabled, setOrgCreationDisabled] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <NoSymbolIcon className="h-4 w-4" />
          Instance Settings
        </CardTitle>
        <CardDescription>
          Global configuration toggles for this DevGuard instance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
            <div>
              <p className="text-sm font-medium">
                Disable Organisation Creation
              </p>
              <p className="text-xs text-muted-foreground">
                When enabled, regular users cannot create new organisations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {orgCreationDisabled && <Badge variant="danger">Disabled</Badge>}
              <Switch
                disabled={true} // TODO: This setting is not actually implemented yet
                checked={orgCreationDisabled}
                onCheckedChange={(checked) => {
                  setOrgCreationDisabled(checked);
                  toast.success(
                    checked
                      ? "Organisation creation disabled for regular users."
                      : "Organisation creation re-enabled.",
                  );
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
