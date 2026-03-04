// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BuildingOffice2Icon,
  ChevronRightIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import { UserCircle2Icon } from "lucide-react";

// ── Types & mock data ──────────────────────────────────────────

interface OrgAdmin {
  id: string;
  email: string;
}

interface ExternalOrg {
  id: string;
  /** The reserved @-prefixed slug, e.g. "@gitlab" or "@opencode" */
  slug: string;
  /** Display name for the GitLab instance */
  instanceName: string;
  /** Base URL of the GitLab instance */
  instanceUrl: string;
  admins: OrgAdmin[];
}

const mockExternalOrgs: ExternalOrg[] = [
  {
    id: "ext-1",
    slug: "@gitlab",
    instanceName: "GitLab.com",
    instanceUrl: "https://gitlab.com",
    admins: [
      { id: "u1", email: "alice@acme.corp" },
      { id: "u2", email: "bob@acme.corp" },
    ],
  },
  {
    id: "ext-2",
    slug: "@opencode",
    instanceName: "OpenCode",
    instanceUrl: "https://gitlab.opencode.de",
    admins: [{ id: "u3", email: "carol@gov.de" }],
  },
];

// ── Component ──────────────────────────────────────────────────

export default function ExternalOrgAdminCard() {
  const [orgs, setOrgs] = useState(mockExternalOrgs);
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [confirmAssign, setConfirmAssign] = useState<{
    orgId: string;
    email: string;
  } | null>(null);

  const requestAssignAdmin = useCallback(
    (orgId: string) => {
      const email = (emailInputs[orgId] ?? "").trim();
      if (!email) return;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      const org = orgs.find((o) => o.id === orgId);
      if (org?.admins.some((a) => a.email === email)) {
        toast.error(`${email} is already an admin of ${org.slug}.`);
        return;
      }

      setConfirmAssign({ orgId, email });
    },
    [emailInputs, orgs],
  );

  const handleAssignAdmin = useCallback(
    (orgId: string, email: string) => {
      const org = orgs.find((o) => o.id === orgId);

      // TODO: POST to admin API to verify the user exists & assign admin role
      const newAdmin: OrgAdmin = {
        id: `generated-${Date.now()}`,
        email,
      };

      setOrgs((prev) =>
        prev.map((o) =>
          o.id === orgId ? { ...o, admins: [...o.admins, newAdmin] } : o,
        ),
      );
      setEmailInputs((prev) => ({ ...prev, [orgId]: "" }));
      setAddingFor(null);
      setConfirmAssign(null);
      toast.success(`Added ${email} as admin for ${org?.slug}.`);
    },
    [orgs],
  );

  const handleRevokeAdmin = useCallback(
    (orgId: string, adminId: string) => {
      const org = orgs.find((o) => o.id === orgId);
      const admin = org?.admins.find((a) => a.id === adminId);
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === orgId
            ? { ...o, admins: o.admins.filter((a) => a.id !== adminId) }
            : o,
        ),
      );
      toast.success(`Revoked admin privileges for ${admin?.email ?? adminId}.`);
    },
    [orgs],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BuildingOffice2Icon className="h-4 w-4" />
          External Organisation Admin Management
        </CardTitle>
        <CardDescription>
          Manage admin privileges for organisations with deep project sync.
          These are reserved <code className="text-xs">@</code>-prefixed
          organisations backed by GitLab integrations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {orgs.map((org) => (
            <Collapsible key={org.id} className="rounded-md border">
              <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors [&[data-state=open]>svg:first-child]:rotate-90">
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                <span className="text-sm font-medium font-mono">
                  {org.slug}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {org.admins.length}{" "}
                  {org.admins.length === 1 ? "admin" : "admins"}
                </span>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t px-4 pb-4 pt-3">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Connected to{" "}
                    <a
                      href={org.instanceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      {org.instanceName}
                    </a>
                  </p>

                  {/* Admin list */}
                  <div className="space-y-2">
                    {org.admins.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        No admins assigned.
                      </p>
                    )}
                    {org.admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 bg-background"
                      >
                        <UserCircle2Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate text-sm font-mono">
                          {admin.email}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleRevokeAdmin(org.id, admin.id)}
                        >
                          <TrashIcon className="mr-1 h-3.5 w-3.5" />
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add admin */}
                  {addingFor === org.id ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        className="h-9 flex-1 text-xs"
                        type="email"
                        placeholder="user@example.com"
                        value={emailInputs[org.id] ?? ""}
                        variant="onCard"
                        autoFocus
                        onChange={(e) =>
                          setEmailInputs((prev) => ({
                            ...prev,
                            [org.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") requestAssignAdmin(org.id);
                          if (e.key === "Escape") setAddingFor(null);
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-8"
                        disabled={!(emailInputs[org.id] ?? "").trim()}
                        onClick={() => requestAssignAdmin(org.id)}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => setAddingFor(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8"
                      onClick={() => setAddingFor(org.id)}
                    >
                      <UserPlusIcon className="mr-1.5 h-3.5 w-3.5" />
                      Add Admin
                    </Button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Confirmation dialog */}
        <AlertDialog
          open={!!confirmAssign}
          onOpenChange={(open) => !open && setConfirmAssign(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Admin Assignment</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to grant admin privileges to{" "}
                <span className="font-mono font-medium text-foreground">
                  {confirmAssign?.email}
                </span>{" "}
                for the organisation{" "}
                <span className="font-mono font-medium text-foreground">
                  {orgs.find((o) => o.id === confirmAssign?.orgId)?.slug}
                </span>
                . This user will be able to manage all projects and settings
                within this organisation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmAssign) {
                    handleAssignAdmin(confirmAssign.orgId, confirmAssign.email);
                  }
                }}
              >
                Confirm &amp; Add Admin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
