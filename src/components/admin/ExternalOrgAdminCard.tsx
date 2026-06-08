// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useInstanceAdmin } from "@/context/InstanceAdminContext";
import { adminBrowserApiClient, AdminAPIError } from "@/services/adminApi";

// ── Types ──────────────────────────────────────────────────────

interface OrgAdmin {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

export interface ExternalOrg {
  id: string;
  /** The reserved @-prefixed slug, e.g. "@gitlab" or "@opencode" */
  slug: string;
  /** Identifier of the backing instance integration (e.g. "opencode") */
  instance_id: string;
  admins: OrgAdmin[];
}

interface Props {
  orgs: ExternalOrg[];
}

// ── Component ──────────────────────────────────────────────────

export default function ExternalOrgAdminCard({ orgs: initialOrgs }: Props) {
  const { getPrivateKey } = useInstanceAdmin();
  const [orgs, setOrgs] = useState<ExternalOrg[]>(initialOrgs);

  useEffect(() => {
    setOrgs(initialOrgs);
  }, [initialOrgs]);
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmAssign, setConfirmAssign] = useState<{
    orgId: string;
    email: string;
  } | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<{
    orgId: string;
    adminId: string;
    name: string;
  } | null>(null);

  const requestAssignAdmin = useCallback(
    (orgId: string) => {
      const email = (emailInputs[orgId] ?? "").trim();
      if (!email) return;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      setConfirmAssign({ orgId, email });
    },
    [emailInputs],
  );

  const handleAssignAdmin = useCallback(
    async (orgId: string, email: string) => {
      const org = orgs.find((o) => o.id === orgId);

      const privateKey = getPrivateKey();
      if (!privateKey) {
        toast.error("Admin session expired. Please re-authenticate.");
        return;
      }

      setAssigning(true);
      try {
        const resp = await adminBrowserApiClient(
          `/admin/external-orgs/${encodeURIComponent(orgId)}/admins/${encodeURIComponent(email)}`,
          privateKey,
          {
            method: "PUT",
          },
        );

        if (!resp.ok) {
          let message = `HTTP ${resp.status}`;
          try {
            const text = await resp.text();
            const json = JSON.parse(text);
            if (typeof json === "string") message = json;
            else if (json?.message) message = json.message;
            else if (text) message = text;
          } catch {
            // keep default message
          }
          throw new AdminAPIError(message, resp.status);
        }

        let newAdmin: OrgAdmin = {
          id: `generated-${Date.now()}`,
          name: email,
          avatarUrl: null,
          role: "admin",
        };
        try {
          const data = await resp.json();
          if (data && typeof data === "object" && "id" in data) {
            newAdmin = {
              id: String(data.id),
              name: data.name ?? email,
              avatarUrl: data.avatarUrl ?? null,
              role: data.role ?? "admin",
            };
          }
        } catch {
          // backend returned no JSON body — fall back to optimistic admin
        }

        setOrgs((prev) =>
          prev.map((o) =>
            o.id === orgId ? { ...o, admins: [...o.admins, newAdmin] } : o,
          ),
        );
        setEmailInputs((prev) => ({ ...prev, [orgId]: "" }));
        setAddingFor(null);
        setConfirmAssign(null);
        toast.success(`Added ${email} as admin for ${org?.slug}.`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown error";
        toast.error(`Failed to add admin: ${message}`);
      } finally {
        setAssigning(false);
      }
    },
    [orgs, getPrivateKey],
  );

  const handleRevokeAdmin = useCallback(
    async (orgId: string, adminId: string) => {
      const org = orgs.find((o) => o.id === orgId);
      const admin = org?.admins.find((a) => a.id === adminId);

      const privateKey = getPrivateKey();
      if (!privateKey) {
        toast.error("Admin session expired. Please re-authenticate.");
        return;
      }

      setRevokingId(adminId);
      try {
        const resp = await adminBrowserApiClient(
          `/admin/external-orgs/${encodeURIComponent(orgId)}/admins/${encodeURIComponent(adminId)}`,
          privateKey,
          {
            method: "DELETE",
          },
        );

        if (!resp.ok) {
          let message = `HTTP ${resp.status}`;
          try {
            const text = await resp.text();
            const json = JSON.parse(text);
            if (typeof json === "string") message = json;
            else if (json?.message) message = json.message;
            else if (text) message = text;
          } catch {
            // keep default message
          }
          throw new AdminAPIError(message, resp.status);
        }

        setOrgs((prev) =>
          prev.map((o) =>
            o.id === orgId
              ? { ...o, admins: o.admins.filter((a) => a.id !== adminId) }
              : o,
          ),
        );
        setConfirmRevoke(null);
        toast.success(
          `Revoked admin privileges for ${admin?.name ?? adminId}.`,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown error";
        toast.error(`Failed to revoke admin: ${message}`);
      } finally {
        setRevokingId(null);
      }
    },
    [orgs, getPrivateKey],
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
                    <span className="font-mono text-foreground">
                      {org.instance_id}
                    </span>
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
                        {admin.avatarUrl ? (
                          <img
                            src={admin.avatarUrl}
                            alt=""
                            className="h-5 w-5 shrink-0 rounded-full"
                          />
                        ) : (
                          <UserCircle2Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="flex-1 truncate text-sm">
                          {admin.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {admin.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          disabled={revokingId === admin.id}
                          onClick={() =>
                            setConfirmRevoke({
                              orgId: org.id,
                              adminId: admin.id,
                              name: admin.name,
                            })
                          }
                        >
                          <TrashIcon className="mr-1 h-3.5 w-3.5" />
                          {revokingId === admin.id ? "Revoking…" : "Revoke"}
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
                        disabled={
                          assigning || !(emailInputs[org.id] ?? "").trim()
                        }
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
          onOpenChange={(open) => {
            if (!open && !assigning) setConfirmAssign(null);
          }}
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
              <AlertDialogCancel disabled={assigning}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={assigning}
                onClick={(e) => {
                  e.preventDefault();
                  if (confirmAssign) {
                    handleAssignAdmin(confirmAssign.orgId, confirmAssign.email);
                  }
                }}
              >
                {assigning ? "Adding…" : "Confirm & Add Admin"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Revoke confirmation dialog */}
        <AlertDialog
          open={!!confirmRevoke}
          onOpenChange={(open) => {
            if (!open && !revokingId) setConfirmRevoke(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke admin privileges?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to revoke admin privileges from{" "}
                <span className="font-mono font-medium text-foreground">
                  {confirmRevoke?.name}
                </span>{" "}
                for the organisation{" "}
                <span className="font-mono font-medium text-foreground">
                  {orgs.find((o) => o.id === confirmRevoke?.orgId)?.slug}
                </span>
                . They will immediately lose the ability to manage projects and
                settings within this organisation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={!!revokingId}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={!!revokingId}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirmRevoke) {
                    handleRevokeAdmin(
                      confirmRevoke.orgId,
                      confirmRevoke.adminId,
                    );
                  }
                }}
              >
                {revokingId ? "Revoking…" : "Revoke admin"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
