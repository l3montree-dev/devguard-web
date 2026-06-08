// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NoSymbolIcon } from "@heroicons/react/20/solid";
import { useInstanceSettings } from "@/hooks/useInstanceSettings";

export default function InstanceSettingsCard() {
  // Reuses the shared hook backing RootHeader (GET /api/v1/instance-settings/).
  const instanceSettings = useInstanceSettings();
  const loading = instanceSettings === null;
  const singleOrganizationMode =
    instanceSettings?.singleOrganizationMode ?? false;

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
          {/* Single Organisation Mode — real value, currently env-controlled */}
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
            <div>
              <p className="text-sm font-medium">Single Organisation Mode</p>
              <p className="text-xs text-muted-foreground">
                When enabled, the instance runs with a single organisation and
                regular users cannot create new organisations. Currently
                configured via the{" "}
                <code className="font-mono">SINGLE_ORGANIZATION_MODE</code>{" "}
                environment variable — in-app editing is coming soon.
              </p>
            </div>
            <div className="min-w-26 flex items-center justify-end gap-3">
              {loading ? (
                <Skeleton className="h-5 w-16 rounded-full" />
              ) : (
                <Badge
                  variant={singleOrganizationMode ? "danger" : "secondary"}
                >
                  {singleOrganizationMode ? "Enabled" : "Disabled"}
                </Badge>
              )}
            </div>
          </div>

          {/* Placeholders for settings not yet backed by the API. */}
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium">Disable Public OCI Proxy</p>
              <p className="text-xs text-muted-foreground">
                When enabled, the public OCI proxy is disabled, preventing users
                from pulling container images through it.
              </p>
            </div>
            <div className="min-w-26 flex items-center justify-end gap-3">
              <Badge variant="outline">Coming soon</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium">Disable User Registration</p>
              <p className="text-xs text-muted-foreground">
                When enabled, new user registrations are disabled.
              </p>
            </div>
            <div className="min-w-26 flex items-center justify-end gap-3">
              <Badge variant="outline">Coming soon</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
