// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { SettingsFlow, UpdateSettingsFlowBody } from "@ory/client";

import CopyCode from "@/components/common/CopyCode";
import DateString from "@/components/common/DateString";
import ListItem from "@/components/common/ListItem";
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
import { middleware } from "@/decorators/middleware";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { UserIcon } from "@heroicons/react/24/solid";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Page from "../components/Page";
import Section from "../components/common/Section";
import { Flow, Methods } from "../components/kratos/Flow";

import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "../decorators/withSession";
import { LogoutLink } from "../hooks/logoutLink";
import {
  browserApiClient,
  getApiClientFromContext,
} from "../services/devGuardApi";
import { handleFlowError, ory } from "../services/ory";
import { PatWithPrivKey, PersonalAccessTokenDTO } from "../types/api/api";
import ConfirmTokenDeletion from "@/components/common/ConfirmTokenDeletion";
import { Switch } from "@/components/ui/switch";

interface Props {
  flow?: SettingsFlow;
  only?: Methods;
}

function SettingsCard({
  flow,
  only,
  children,
}: Props & { children: ReactNode }) {
  if (!flow) {
    return null;
  }

  const nodes = only
    ? flow.ui.nodes.filter(({ group }) => group === only)
    : flow.ui.nodes;

  if (nodes.length === 0) {
    return null;
  }

  return children;
}

const Settings: FunctionComponent<{
  personalAccessTokens: Array<PersonalAccessTokenDTO>;
}> = ({ personalAccessTokens: pats }) => {
  const [flow, setFlow] = useState<SettingsFlow>();

  // Get ?flow=... from the URL
  const router = useRouter();
  const { flow: flowId, return_to: returnTo } = router.query;

  const { register, handleSubmit, reset } = useForm<{
    description: string;
    scanAsset: boolean;
    manageAsset: boolean;
  }>();

  const { personalAccessTokens, onDeletePat, onCreatePat, pat } =
    usePersonalAccessToken(pats);

  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (!router.isReady || flow) {
      return;
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getSettingsFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data);
        })
        .catch(handleFlowError(router, "settings", setFlow));
      return;
    }

    // Otherwise we initialize it
    ory
      .createBrowserSettingsFlow({
        returnTo: String(returnTo || ""),
      })
      .then(({ data }) => {
        setFlow(data);
      })
      .catch(handleFlowError(router, "settings", setFlow));
  }, [flowId, router, router.isReady, returnTo, flow]);

  const onSubmit = (values: UpdateSettingsFlowBody) =>
    router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // his data when she/he reloads the page.
      .push(`/user-settings?flow=${flow?.id}`, undefined, { shallow: true })
      .then(() =>
        ory
          .updateSettingsFlow({
            flow: String(flow?.id),
            updateSettingsFlowBody: values,
          })
          .then(({ data }) => {
            // The settings have been saved and the flow was updated. Let's show it to the user!
            setFlow(data);

            // continue_with is a list of actions that the user might need to take before the settings update is complete.
            // It could, for example, contain a link to the verification form.
            if (data.continue_with) {
              for (const item of data.continue_with) {
                switch (item.action) {
                  case "show_verification_ui":
                    router.push("/login?flow=" + item.flow.id);
                    return;
                }
              }
            }

            if (data.return_to) {
              window.location.href = data.return_to;
              return;
            }
          })
          .catch(handleFlowError(router, "settings", setFlow))
          .catch(async (err: AxiosError) => {
            // If the previous handler did not catch the error it's most likely a form validation error
            if (err.response?.status === 400) {
              // Yup, it is!
              //@ts-expect-error
              setFlow(err.response?.data);
              return;
            }

            return Promise.reject(err);
          }),
      );

  const handleCreatePat = async (data: {
    description: string;
    scanAsset: boolean;
    manageAsset: boolean;
  }) => {
    await onCreatePat(data);
    reset();
  };

  const handleLogout = LogoutLink();

  useEffect(() => {
    if (flow?.ui.messages) {
      flow.ui.messages.forEach((message) => {
        toast(message.type.toLocaleLowerCase(), {
          description: message.text,
        });
      });
    }
  }, [flow?.ui.messages]);

  const handleRevokePat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const privkey = formData.get("privkey") as string;
    browserApiClient("/pats/revoke-by-private-key", {
      method: "POST",
      body: JSON.stringify({ privkey }),
    }).then(() => {
      toast("Token revoked", {
        description: "Your token was successfully revoked",
      });
    });
  };

  return (
    <Page title="Profile Management and Security Settings">
      <div className="dark:text-white">
        <Section
          id="profile"
          description="Use a permanent address where you can receive mail."
          title="Profile Management & Security Settings"
        >
          <div className="grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full flex items-center gap-x-8">
              <div className="rounded-lg border bg-card p-2">
                <UserIcon width={60} height={60} />
              </div>
              <div>
                <Button disabled>Change avatar</Button>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  JPG, GIF or PNG. 1MB max.
                </p>
              </div>
            </div>

            <div className="col-span-full">
              <SettingsCard only="profile" flow={flow}>
                <Flow
                  hideGlobalMessages
                  onSubmit={onSubmit}
                  only="profile"
                  flow={flow}
                />
              </SettingsCard>
            </div>
          </div>
        </Section>

        <Section
          id="password"
          title="Change Password"
          description="Update your password associated with your account."
        >
          <SettingsCard only="password" flow={flow}>
            <Flow
              hideGlobalMessages
              onSubmit={onSubmit}
              only="password"
              flow={flow}
            />
          </SettingsCard>
        </Section>

        <Section
          id="pat"
          title="Manage Personal Access Tokens"
          description="Personal Access Tokens are needed to integrate scanners and other software which should be able to provide CVE findings to DevGuard"
        >
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Create Personal Access Token </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(handleCreatePat)}>
              <CardContent>
                <Label htmlFor="description">Description</Label>
                <Input {...register("description")} />

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Label htmlFor="scanAsset" className="flex-1">
                    scan Asset
                    <span className="block text-sm text-gray-500">
                      Use this token to scan your repositories.
                    </span>
                  </Label>
                  <Switch {...register("scanAsset")} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Label htmlFor="manageAsset" className="flex-1">
                    manage Asset
                    <span className="block text-sm text-gray-500">
                      Use this token to manage your repositories.
                    </span>
                  </Label>
                  <Switch {...register("manageAsset")} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <div className="mt-6 flex flex-row justify-end">
                  <Button type="submit">Create</Button>
                </div>
              </CardFooter>
            </form>
          </Card>
          {personalAccessTokens.map((pat) =>
            "privKey" in pat ? (
              <React.Fragment key={pat.fingerprint}>
                <Card>
                  <CardHeader>
                    <CardTitle>{pat.description} </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <CopyCode
                      codeString={pat.privKey}
                      language="shell"
                    ></CopyCode>
                    <span className="mt-2 block text-sm text-destructive">
                      Make sure to copy the token. You won&apos;t be able to see
                      it ever again
                    </span>
                  </CardContent>
                </Card>
              </React.Fragment>
            ) : null,
          )}

          <div className="mb-6 flex flex-col gap-4">
            {personalAccessTokens.map((pat) =>
              "privKey" in pat ? (
                <></>
              ) : (
                <ListItem
                  key={pat.id}
                  Title={pat.description}
                  description={
                    <>
                      Rights: {pat.scanAsset ? "Scanning" : ""}{" "}
                      {pat.manageAsset ? "Management" : ""}
                      <br />
                      Created at: <DateString date={new Date(pat.createdAt)} />
                      <br />
                      Last used:{" "}
                      {pat.lastUsedAt ? (
                        <DateString date={new Date(pat.lastUsedAt)} />
                      ) : (
                        "Never"
                      )}
                    </>
                  }
                  Button={
                    <ConfirmTokenDeletion
                      Button={
                        <Button
                          variant="destructive"
                          onClick={() => onDeletePat(pat)}
                        >
                          Yes
                        </Button>
                      }
                    >
                      <Button>Delete</Button>
                    </ConfirmTokenDeletion>
                  }
                />
              ),
            )}
          </div>
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Revoke access token</CardTitle>
            </CardHeader>
            <form onSubmit={handleRevokePat}>
              <CardContent>
                <Input name="privkey" placeholder="Paste token here" />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" variant="destructiveOutline">
                  Revoke
                </Button>
              </CardFooter>
            </form>
          </Card>
        </Section>

        <Section
          id="oidc"
          title="Manage Social Sign In"
          description="Update your linked social network accounts."
        >
          <SettingsCard only="oidc" flow={flow}>
            <Flow
              hideGlobalMessages
              onSubmit={onSubmit}
              only="oidc"
              flow={flow}
            />
          </SettingsCard>
        </Section>
        <Section
          id="passkey"
          title="Manage Hardware Tokens and Biometrics"
          description="Use Hardware Tokens (e.g. YubiKey) or Biometrics (e.g. FaceID, TouchID) to enhance your account security."
        >
          <SettingsCard only="passkey" flow={flow}>
            <Flow
              hideGlobalMessages
              onSubmit={onSubmit}
              only="passkey"
              flow={flow}
            />
          </SettingsCard>
        </Section>

        <Section
          id="totp"
          title="Manage 2FA TOTP Authenticator App"
          description={
            <>
              Add a TOTP Authenticator App to your account to improve your
              account security. Popular Authenticator Apps are{" "}
              <Link
                href="https://www.lastpass.com"
                rel="noreferrer"
                target="_blank"
              >
                LastPass
              </Link>{" "}
              and Google Authenticator (
              <Link
                href="https://apps.apple.com/us/app/google-authenticator/id388497605"
                target="_blank"
                rel="noreferrer"
              >
                iOS
              </Link>
              ,{" "}
              <Link
                href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US"
                target="_blank"
                rel="noreferrer"
              >
                Android
              </Link>
              ).
            </>
          }
        >
          <SettingsCard only="totp" flow={flow}>
            <Flow
              hideGlobalMessages
              onSubmit={onSubmit}
              only="totp"
              flow={flow}
            />
          </SettingsCard>
        </Section>
        <Section
          id="lookup_secret"
          title="Manage 2FA Backup Recovery Codes"
          description="Recovery codes can be used in panic situations where you have lost
        access to your 2FA device."
        >
          <SettingsCard only="lookup_secret" flow={flow}>
            <Flow
              hideGlobalMessages
              onSubmit={onSubmit}
              only="lookup_secret"
              flow={flow}
            />
          </SettingsCard>
        </Section>

        <div className="flex flex-row justify-end">
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </Page>
  );
};

// just guard the page with the session decorator
export const getServerSideProps = middleware(
  async (ctx, { session }) => {
    if (!session) {
      return {
        redirect: {
          destination: `/login`,
          permanent: false,
        },
      };
    }
    // get the personal access tokens from the user
    const apiClient = getApiClientFromContext(ctx);

    const personalAccessTokens: Array<PersonalAccessTokenDTO> = await apiClient(
      "/pats/",
    ).then((r) => r.json());
    return {
      props: {
        personalAccessTokens,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
  },
);

export default Settings;
