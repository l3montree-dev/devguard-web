"use client";

import ManagePatsDialog from "@/components/ManagePatsDialog";
import NewTokenDialog from "@/components/NewTokenDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { getLogoutUrl } from "@/server/actions/logout";
import Link from "next/link";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import CopyInput from "../../../components/common/CopyInput";
import Section from "../../../components/common/Section";
import { useConfig } from "../../../context/ConfigContext";
import { fetcher } from "../../../data-fetcher/fetcher";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { PatWithPrivKey, PersonalAccessTokenDTO } from "../../../types/api/api";

const PatManagementSection: FunctionComponent = () => {
  const [newToken, setNewToken] = useState<PatWithPrivKey | null>(null);
  const currentUser = useCurrentUser();

  const { register, handleSubmit, reset, setValue, watch } = useForm<{
    description: string;
    scan: boolean;
    manage: boolean;
  }>({
    defaultValues: {
      description: "",
      scan: true,
      manage: false,
    },
  });

  const { data: pats } = useSWR<Array<PersonalAccessTokenDTO>>(
    "/pats/",
    fetcher,
    { fallbackData: [] },
  );

  const { personalAccessTokens, onDeletePat, onCreatePat } =
    usePersonalAccessToken(pats);

  const config = useConfig();

  const handleCreatePat = async (data: {
    description: string;
    scan: boolean;
    manage: boolean;
  }) => {
    let scopes = "";
    if (data.scan) {
      scopes += "scan";
    }
    if (data.manage) {
      if (scopes) {
        scopes += " ";
      }
      scopes += "manage";
    }

    if (!scopes) {
      toast.error("Please select at least one scope", {
        description: "A token must have at least one permission scope.",
      });
      return;
    }

    try {
      const createdToken = await onCreatePat({
        description: data.description,
        scopes,
      });
      setNewToken(createdToken);
      reset();
    } catch (error) {
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
        description="Personal Access Tokens are needed to integrate scanners and other software which should be able to provide CVE findings to DevGuard"
      >
        <Card className="">
          <CardHeader>
            <CardTitle>Create Personal Access Token </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(handleCreatePat)}>
            <CardContent>
              <Label htmlFor="description">Description</Label>
              <Input
                className="mt-2"
                variant="onCard"
                {...register("description")}
              />

              <div className="mt-4">
                <span>Select scopes</span>
                <span className="block text-sm text-gray-500">
                  Scopes set the permissions of the token. You can choose
                  multiple scopes.
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Label htmlFor="scan" className="flex-1">
                  Scan
                  <span className="block text-sm text-gray-500">
                    Use this token to scan your repositories.
                  </span>
                </Label>
                <Switch
                  onCheckedChange={(e) => setValue("scan", e)}
                  checked={Boolean(watch("scan"))}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Label htmlFor="manage" className="flex-1">
                  Manage
                  <span className="block text-sm text-gray-500">
                    Use this token to manage your repositories.
                  </span>
                </Label>
                <Switch
                  onCheckedChange={(e) => setValue("manage", e)}
                  checked={Boolean(watch("manage"))}
                />
              </div>
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
              <div className="flex flex-row justify-end">
                <Button type="submit">Create</Button>
              </div>
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
