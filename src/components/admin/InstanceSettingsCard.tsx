// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { NoSymbolIcon } from "@heroicons/react/20/solid";
import { useInstanceSettings } from "@/hooks/useInstanceSettings";
import { useInstanceAdmin } from "@/context/InstanceAdminContext";
import { adminBrowserApiClient, AdminAPIError } from "@/services/adminApi";

export default function InstanceSettingsCard() {
  // Reuses the shared hook backing RootHeader (GET /api/v1/instance-settings/).
  const instanceSettings = useInstanceSettings();
  const { getPrivateKey } = useInstanceAdmin();
  const loading = instanceSettings === null;
  const singleOrganizationMode =
    instanceSettings?.singleOrganizationMode ?? false;
  // User-facing framing: org creation is *enabled* when single-org mode is off.
  const orgCreationEnabled = !singleOrganizationMode;
  const [saving, setSaving] = useState(false);

  const handleToggleOrgCreation = async (creationEnabled: boolean) => {
    const privateKey = getPrivateKey();
    if (!privateKey) {
      toast.error("Admin session expired. Please re-authenticate.");
      return;
    }

    // The technical flag is the inverse of the user-facing toggle:
    // SINGLE_ORGANIZATION_MODE / disable_org_creation is true when creation is off.
    const disableOrgCreation = !creationEnabled;

    setSaving(true);
    // Optimistically reflect the new value across all consumers of the hook
    // (RootHeader, OrganizationDropDown, …) while the request is in flight.
    mutate(
      "/instance-settings/",
      { singleOrganizationMode: disableOrgCreation },
      false,
    );
    try {
      const resp = await adminBrowserApiClient("/admin/settings", privateKey, {
        method: "PATCH",
        body: JSON.stringify({ disable_org_creation: disableOrgCreation }),
      });
      if (!resp.ok) {
        throw new AdminAPIError(
          `Failed to update instance settings (HTTP ${resp.status})`,
          resp.status,
        );
      }
      toast.success(
        creationEnabled
          ? "Organisation creation enabled."
          : "Organisation creation disabled.",
      );
    } catch (err) {
      const message =
        err instanceof AdminAPIError
          ? err.message
          : "Failed to update instance settings. Is the API reachable?";
      toast.error(message);
    } finally {
      mutate("/instance-settings/");
      setSaving(false);
    }
  };

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
              <p className="text-sm font-medium">Organisation Creation</p>
              <p className="text-xs text-muted-foreground">
                When disabled, regular users cannot create new organisations.
                Organisations that already exist continue to work as normal.
                Seeded from the{" "}
                <code className="font-mono">SINGLE_ORGANIZATION_MODE</code>{" "}
                environment variable; changes made here are stored on the
                instance and take precedence.
              </p>
            </div>
            <div className="min-w-36 flex items-center justify-end gap-3">
              {loading ? (
                <Skeleton className="h-6 w-11 rounded-full" />
              ) : (
                <>
                  <Badge variant={orgCreationEnabled ? "secondary" : "danger"}>
                    {orgCreationEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={orgCreationEnabled}
                    disabled={saving}
                    onCheckedChange={handleToggleOrgCreation}
                    aria-label="Toggle Organisation Creation"
                  />
                </>
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
            <div className="min-w-36 flex items-center justify-end gap-3">
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
            <div className="min-w-36 flex items-center justify-end gap-3">
              <Badge variant="outline">Coming soon</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
