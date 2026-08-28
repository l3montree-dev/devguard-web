// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import ManagePatsDialog from "@/components/ManagePatsDialog";
import NewTokenDialog from "@/components/NewTokenDialog";
import { DatePicker } from "@/components/DatePicker";
import FormSection from "@/components/common/FormSection";
import OutlineSelectCard from "@/components/common/OutlineSelectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import useAccessToken from "@/hooks/useAccessToken";
import { toast } from "@/lib/toast";
import { addYears } from "date-fns";
import { KeyRoundIcon, ShieldCheckIcon } from "lucide-react";
import type { FunctionComponent } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import Section from "@/components/common/Section";
import { fetcher } from "@/data-fetcher/fetcher";
import type {
  AsymmetricAccessTokenDTO,
  SeeOncePatWithBearerToken,
  SeeOncePatWithPrivKey,
  SymmetricAccessTokenDTO,
} from "@/types/api/api";

const TOKEN_TYPES = [
  {
    value: false,
    icon: ShieldCheckIcon,
    label: "Asymmetric",
    tag: "Recommended",
    description:
      "A key pair is generated in your browser. Only the public key is stored in DevGuard. Each request is cryptographically signed, so the token alone cannot be replayed. Use this with the DevGuard Scanner CLI.",
  },
  {
    value: true,
    icon: KeyRoundIcon,
    label: "Symmetric (Bearer)",
    tag: null,
    description:
      "A single secret is sent as a plain HTTP header. No signing required — easy to integrate with tools that do not support request signing. Best suited for short-lived tokens in trusted environments.",
  },
] as const;

interface AccessTokenManagementProps {
  url: string;
  section: {
    title: string;
    description: string;
  };
}

const AccessTokenManagement: FunctionComponent<AccessTokenManagementProps> = ({
  url,
  section,
}) => {
  const [newToken, setNewToken] = useState<
    SeeOncePatWithPrivKey | SeeOncePatWithBearerToken | null
  >(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [expiryError, setExpiryError] = useState<string | null>(null);

  const handleExpiryDateChange = (date: Date | undefined) => {
    setExpiryDate(date);
    if (!date) {
      setExpiryError(null);
    } else if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      setExpiryError("Expiry date cannot be in the past.");
    } else if (date > addYears(new Date(), 1)) {
      setExpiryError("Expiry date cannot be more than 1 year in the future.");
    } else {
      setExpiryError(null);
    }
  };

  const { register, handleSubmit, reset, setValue, watch } = useForm<{
    description: string;
    scan: boolean;
    manage: boolean;
    symmetric: boolean;
  }>({
    defaultValues: {
      description: "",
      scan: true,
      manage: false,
      symmetric: false,
    },
  });

  const symmetric = watch("symmetric");

  const { data: pats } = useSWR<
    Array<SymmetricAccessTokenDTO | AsymmetricAccessTokenDTO>
  >(url, fetcher, { fallbackData: [] });

  const {
    AccessToken: accessTokens,
    onDeleteAccessToken: onDeletePat,
    onCreateAccessToken: onCreatePat,
  } = useAccessToken(pats);

  const handleCreatePat = async (data: {
    description: string;
    scan: boolean;
    manage: boolean;
    symmetric: boolean;
  }) => {
    let scopes = "";
    if (data.scan) scopes += "scan";
    if (data.manage) {
      if (scopes) scopes += " ";
      scopes += "manage";
    }

    if (!scopes) {
      toast.error("Please select at least one scope", {
        description: "A token must have at least one permission scope.",
      });
      return;
    }

    if (!expiryDate) {
      toast.error("Please select an expiry date", {
        description: "A token must have an expiry date.",
      });
      return;
    }

    if (expiryError) {
      toast.error("Invalid expiry date", {
        description: expiryError,
      });
      return;
    }

    try {
      const createdToken = await onCreatePat({
        description: data.description,
        scopes,
        expiryDateUnix: Math.floor(expiryDate.getTime() / 1000),
        symmetric: data.symmetric,
      });
      setNewToken(createdToken);
      setExpiryDate(undefined);
      setExpiryError(null);
      reset();
    } catch {
      toast.error("Failed to create token", {
        description:
          "An error occurred while creating the token. Please try again.",
      });
    }
  };

  return (
    <>
      <Section
        id="access-tokens"
        title={section.title}
        description={section.description}
      >
        <Card className="pt-6">
          <form onSubmit={handleSubmit(handleCreatePat)}>
            <CardContent>
              <FormSection step={1} title="Description">
                <Input
                  variant="onCard"
                  placeholder="e.g. GitLab CI pipeline"
                  {...register("description")}
                />
              </FormSection>

              <FormSection step={2} title="Token type">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {TOKEN_TYPES.map((type) => (
                    <OutlineSelectCard
                      key={String(type.value)}
                      selected={symmetric === type.value}
                      onClick={() => setValue("symmetric", type.value)}
                      icon={type.icon}
                      label={type.label}
                      tag={type.tag}
                      description={type.description}
                    />
                  ))}
                </div>
              </FormSection>

              <FormSection step={3} title="Scopes">
                <div className="rounded-lg border divide-y border-input dark:border-foreground/10 divide-input dark:divide-foreground/10">
                  <label className="flex cursor-pointer items-center justify-between gap-4 p-3 hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-sm font-medium">Scan</p>
                      <p className="text-xs text-muted-foreground">
                        Submit scan results and CVE findings.
                      </p>
                    </div>
                    <Checkbox
                      checked={Boolean(watch("scan"))}
                      onCheckedChange={(e) => setValue("scan", Boolean(e))}
                    />
                  </label>
                  <label className="flex cursor-pointer items-center justify-between gap-4 p-3 hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-sm font-medium">Manage</p>
                      <p className="text-xs text-muted-foreground">
                        Create and configure assets, projects, and settings.
                      </p>
                    </div>
                    <Checkbox
                      checked={Boolean(watch("manage"))}
                      onCheckedChange={(e) => setValue("manage", Boolean(e))}
                    />
                  </label>
                </div>
              </FormSection>

              <FormSection step={4} title="Expiry date" last>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <DatePicker
                      date={expiryDate}
                      onDateChange={handleExpiryDateChange}
                      variant="onCard"
                    />
                    {expiryDate && !expiryError && (
                      <span className="text-xs text-muted-foreground">
                        Token valid until{" "}
                        {expiryDate.toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  {expiryError && (
                    <p className="text-xs text-destructive">{expiryError}</p>
                  )}
                </div>
              </FormSection>
            </CardContent>
            <CardFooter className="flex justify-between">
              <ManagePatsDialog
                accessTokens={accessTokens}
                onDeletePat={onDeletePat}
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={accessTokens.length === 0}
                  className="disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Manage Existing Tokens ({accessTokens.length})
                </Button>
              </ManagePatsDialog>
              <Button type="submit">Create Token</Button>
            </CardFooter>
          </form>
        </Card>
      </Section>

      <NewTokenDialog
        token={newToken}
        open={!!newToken}
        onClose={() => {
          setNewToken(null);
        }}
      />
    </>
  );
};

export default AccessTokenManagement;
