// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useInstanceAdmin } from "@/context/InstanceAdminContext";
import { adminBrowserApiClient } from "@/services/adminApi";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function InstanceAdminPage() {
  const { isAuthenticated, authenticate, logout, getPrivateKey } =
    useInstanceAdmin();
  const [keyInput, setKeyInput] = useState("");
  const [verifying, setVerifying] = useState(false);

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
      const resp = await adminBrowserApiClient("/admin", trimmedKey);

      if (resp.ok) {
        authenticate(trimmedKey);
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
              <form
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
                      The key is stored in session storage and cleared when you
                      close the tab. It is never sent to the server — it signs
                      requests locally.
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
        <Button variant="destructive" onClick={handleLogout}>
          End Admin Session
        </Button>
      </div>

      <Alert className="mb-6">
        <ShieldCheckIcon className="h-4 w-4" />
        <AlertTitle>Authenticated</AlertTitle>
        <AlertDescription>
          You are authenticated as an instance admin. All requests from this
          page are cryptographically signed with your private key.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Instance Overview</CardTitle>
          <CardDescription>
            Instance administration features will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Admin endpoints are being developed. This page will provide tools
            for managing organizations, users, and instance-wide settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
