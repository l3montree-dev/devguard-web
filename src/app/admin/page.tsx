// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import {
  SessionCountdown,
  useInstanceAdmin,
} from "@/context/InstanceAdminContext";
import { adminBrowserApiClient } from "@/services/adminApi";
import { importAdminKey } from "@/services/admin-request-signing";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Callout from "@/components/common/Callout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import InstanceDashboard, {
  type InstanceDashboardHandle,
} from "@/components/admin/InstanceDashboard";
import InstanceTechnicalInfo, {
  type InstanceTechnicalInfoHandle,
} from "@/components/admin/InstanceTechnicalInfo";
import AdminTools from "@/components/admin/AdminTools";
import Section from "@/components/common/Section";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

export default function InstanceAdminPage() {
  const { isAuthenticated, authenticate, logout } = useInstanceAdmin();
  const [keyInput, setKeyInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const techInfoRef = useRef<InstanceTechnicalInfoHandle>(null);
  const dashboardRef = useRef<InstanceDashboardHandle>(null);

  useEffect(() => {
    // Avoid hydration mismatch: window.location.host is only available client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time flag
    setMounted(true);
  }, []);

  const handleAuthenticate = useCallback(async () => {
    const trimmedKey = keyInput.trim();
    if (!trimmedKey) {
      toast.error("Please enter your private key.");
      return;
    }

    if (!/^[0-9a-fA-F]+$/.test(trimmedKey)) {
      toast.error("Invalid key format. The private key must be hex-encoded.");
      return;
    }

    setVerifying(true);
    try {
      // Import the hex into a non-extractable CryptoKey. The raw hex is never
      // persisted; only this key (which cannot be exported) is kept in memory.
      let key: CryptoKey;
      try {
        key = await importAdminKey(trimmedKey);
      } catch {
        toast.error("Invalid key format. The private key must be hex-encoded.");
        return;
      }

      const resp = await adminBrowserApiClient("/admin", key);

      if (resp.ok) {
        authenticate(key);
        setKeyInput("");
        toast.success("Authenticated as instance admin.");
      } else if (resp.status === 401 || resp.status === 403) {
        toast.error(
          "Authentication failed. The private key does not match the instance's admin public key.",
        );
      } else {
        toast.error(`Unexpected response from server: ${resp.status}`);
      }
    } catch (err) {
      toast.error("Failed to verify key. Is the API reachable?");
    } finally {
      setVerifying(false);
    }
  }, [keyInput, authenticate]);

  const handleLogout = useCallback(() => {
    logout();
    toast.success("Admin session ended. Private key removed from session.");
  }, [logout]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-112px)] flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-md flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Instance Administration</CardTitle>
              <CardDescription>
                Authenticate with your ECDSA P-256 private key to access
                instance admin features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Callout intent="warning" showIcon>
                <p className="font-medium">Verify you trust this site</p>
                <p className="mt-1">
                  You are about to enter your instance admin private key on{" "}
                  <span className="font-mono font-semibold break-all">
                    {mounted ? window.location.host : ""}
                  </span>
                  . Only continue if this is your own DevGuard instance — never
                  paste your key on a site you don&apos;t recognise.
                </p>
              </Callout>
              <form
                className="mt-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthenticate();
                }}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="admin-key">
                      Private Key (hex)
                    </FieldLabel>
                    <Input
                      id="admin-key"
                      type="password"
                      variant="onCard"
                      placeholder="Enter your hex-encoded private key..."
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      autoComplete="off"
                      required
                    />
                    <FieldDescription>
                      The key is held in memory for this tab only and cleared on
                      reload, logout, or after 10 minutes. It is never sent to
                      the server — it signs requests locally.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      disabled={verifying || !keyInput.trim()}
                    >
                      {verifying ? "Verifying..." : "Authenticate"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-6 pb-8 pt-6 lg:px-8">
      <div className="mb-6 flex flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instance Administration</h1>
          <p className="text-sm text-muted-foreground">
            Manage this DevGuard instance.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button variant="destructive" onClick={handleLogout}>
            End Admin Session
          </Button>
          <SessionCountdown />
        </div>
      </div>
      <Section
        title="Admin Tools"
        description="Instance management actions and utilities."
        forceVertical
      >
        <AdminTools />
      </Section>

      <Section
        title="Instance Technical Info"
        description="Build version, runtime details, and database status."
        forceVertical
        Button={
          <Button
            variant="outline"
            size="sm"
            onClick={() => techInfoRef.current?.refresh()}
          >
            <ArrowPathIcon className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      >
        <InstanceTechnicalInfo ref={techInfoRef} />
      </Section>

      <Section
        title="Instance Usage Statistics"
        description="Overview of users, organisations, projects, and security posture across the instance."
        forceVertical
        Button={
          <Button
            variant="outline"
            size="sm"
            onClick={() => dashboardRef.current?.refresh()}
          >
            <ArrowPathIcon className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      >
        <InstanceDashboard ref={dashboardRef} />
      </Section>
    </div>
  );
}
