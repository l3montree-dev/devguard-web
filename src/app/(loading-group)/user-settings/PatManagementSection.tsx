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
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { toast } from "@/lib/toast";
import { getLogoutUrl } from "@/server/actions/logout";
import { KeyRoundIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import type { FunctionComponent } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import Section from "../../../components/common/Section";
import { useConfig } from "../../../context/ConfigContext";
import { fetcher } from "../../../data-fetcher/fetcher";
import type {
  AsymmetricPersonalAccessTokenDTO,
  SeeOncePatWithBearerToken,
  SeeOncePatWithPrivKey,
  SymmetricPersonalAccessTokenDTO,
} from "../../../types/api/api";

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

const PatManagementSection: FunctionComponent = () => {
  const [newToken, setNewToken] = useState<
    SeeOncePatWithPrivKey | SeeOncePatWithBearerToken | null
  >(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

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
    Array<SymmetricPersonalAccessTokenDTO | AsymmetricPersonalAccessTokenDTO>
  >("/pats/", fetcher, { fallbackData: [] });

  const { personalAccessTokens, onDeletePat, onCreatePat } =
    usePersonalAccessToken(pats);

  const config = useConfig();

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

    try {
      const createdToken = await onCreatePat({
        description: data.description,
        scopes,
        expiryDateUnix: Math.floor(expiryDate.getTime() / 1000),
        symmetric: data.symmetric,
      });
      setNewToken(createdToken);
      setExpiryDate(undefined);
      reset();
    } catch {
      toast.error("Failed to create token", {
        description:
          "An error occurred while creating the token. Please try again.",
      });
    }
  };

  const handleLogout = async () => {
    const logoutUrl = await getLogoutUrl();
    window.location.href = logoutUrl;
  };

  return (
    <>
      <Section
        id="pat"
        title="Manage Personal Access Tokens"
        description="Personal Access Tokens allow scanners and other integrations to authenticate with DevGuard on your behalf."
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
                <div className="flex items-center gap-3">
                  <DatePicker
                    date={expiryDate}
                    onDateChange={setExpiryDate}
                    label="Pick a date"
                  />
                  {expiryDate && (
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
              </FormSection>
            </CardContent>
            <CardFooter className="flex justify-between">
              <ManagePatsDialog
                personalAccessTokens={personalAccessTokens}
                onDeletePat={onDeletePat}
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={personalAccessTokens.length === 0}
                  className="disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Manage Existing Tokens ({personalAccessTokens.length})
                </Button>
              </ManagePatsDialog>
              <Button type="submit">Create Token</Button>
            </CardFooter>
          </form>
        </Card>
      </Section>

      <Section
        id="request-account-deletion"
        title="Request Account Deletion"
        description="If you want to delete your account, please click the button below and send a request to our support team to delete your account."
      >
        <Card className="p-6">
          <div className="flex justify-end">
            <Link
              href={
                "mailto:" +
                config.accountDeletionMail +
                "?subject=Request%20DevGuard%20Account%20Deletion&body=Hello%2C%20%0A%0AI%20would%20like%20request%20to%20delete%20my%20DevGuard%20Account.%20%0A%0AThank%20you."
              }
            >
              <Button variant="destructive">Request Account Deletion</Button>
            </Link>
          </div>
        </Card>
      </Section>

      <div className="flex flex-row justify-end">
        <Button
          id="settings-page-logout-button"
          variant={"destructiveOutline"}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

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

export default PatManagementSection;
