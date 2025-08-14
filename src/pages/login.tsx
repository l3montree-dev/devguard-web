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

import {
  LoginFlow,
  UiNodeScriptAttributes,
  UpdateLoginFlowBody,
} from "@ory/client";

import Callout from "@/components/common/Callout";
import Carriage from "@/components/common/Carriage";
import CustomTab from "@/components/common/CustomTab";
import { Messages } from "@/components/kratos/Messages";
import { Tab } from "@headlessui/react";
import { filterNodesByGroups } from "@ory/integrations/ui";
import { AxiosError } from "axios";
import { uniq } from "lodash";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HTMLAttributeReferrerPolicy,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Flow } from "../components/kratos/Flow";

import { LogoutLink } from "../hooks/logoutLink";
import { handleFlowError, ory } from "../services/ory";
import dynamic from "next/dynamic";
import ThreeJSFeatureScreen from "../components/threejs/ThreeJSFeatureScreen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ThreeJSScene = dynamic(
  () => import("../components/threejs/ThreeJSScene"),
  {
    ssr: false,
  },
);

const Login: NextPage = () => {
  const [flow, setFlow] = useState<LoginFlow>();

  // Get ?flow=... from the URL
  const router = useRouter();
  const {
    return_to: returnTo,
    flow: flowId,
    // Refresh means we want to refresh the session. This is needed, for example, when we want to update the password
    // of a user.
    refresh,
    // AAL = Authorization Assurance Level. This implies that we want to upgrade the AAL, meaning that we want
    // to perform two-factor authentication/verification.
    aal,
  } = router.query;

  // This might be confusing, but we want to show the user an option
  // to sign out if they are performing two-factor authentication!
  const onLogout = LogoutLink([aal, refresh]);

  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (!router.isReady || flow) {
      return;
    }

    if (flowId) {
      ory
        .getLoginFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data);
        })
        .catch(handleFlowError(router, "login", setFlow));
      return;
    }

    // Otherwise we initialize it
    ory
      .createBrowserLoginFlow({
        refresh: Boolean(refresh),
        aal: aal ? String(aal) : undefined,
        returnTo: returnTo ? String(returnTo) : undefined,
      })
      .then(({ data }) => {
        setFlow(data);
      })
      .catch(handleFlowError(router, "login", setFlow));
  }, [flowId, router, router.isReady, aal, refresh, returnTo, flow]);

  // Add the WebAuthn script to the DOM
  useEffect(() => {
    if (!flow?.ui.nodes) {
      return;
    }

    const scriptNodes = filterNodesByGroups({
      nodes: flow.ui.nodes,
      groups: "webauthn",
      attributes: "text/javascript",
      withoutDefaultGroup: true,
      withoutDefaultAttributes: true,
    }).map((node) => {
      const attr = node.attributes as UiNodeScriptAttributes;
      const script = document.createElement("script");
      script.src = attr.src;
      script.type = attr.type;
      script.async = attr.async;
      script.referrerPolicy =
        attr.referrerpolicy as HTMLAttributeReferrerPolicy;
      script.crossOrigin = attr.crossorigin;
      script.integrity = attr.integrity;
      document.body.appendChild(script);
      return script;
    });

    // cleanup
    return () => {
      scriptNodes.forEach((script) => {
        document.body.removeChild(script);
      });
    };
  }, [flow?.ui.nodes]);

  const onSubmit = (values: UpdateLoginFlowBody) =>
    router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // his data when she/he reloads the page.
      .push(`/login?flow=${flow?.id}`, undefined, { shallow: true })
      .then(() =>
        ory
          .updateLoginFlow({
            flow: String(flow?.id),
            updateLoginFlowBody: values,
          })
          // We logged in successfully! Let's bring the user home.
          .then(() => {
            if (flow?.return_to) {
              window.location.href = flow?.return_to;
              return;
            }
            router.push("/");
          })
          .then(() => {})
          .catch(handleFlowError(router, "login", setFlow))
          .catch((err: AxiosError) => {
            // If the previous handler did not catch the error it's most likely a form validation error
            if (err.response?.status === 400) {
              // Yup, it is!
              // @ts-expect-error
              setFlow(err.response?.data);
              return;
            }

            return Promise.reject(err);
          }),
      );
  const availableMethods = useMemo(() => {
    return uniq(flow?.ui.nodes.map((node) => node.group));
  }, [flow?.ui.nodes]);

  return (
    <>
      <Head>
        <title>DevGuard - Sign in</title>
        <meta name="description" content="DevGuard Sign in" />
      </Head>
      <div className="flex min-h-screen flex-1 flex-row">
        <div className="flex w-2/5 bg-background flex-col items-center justify-center ">
          <div className="w-full px-26">
            <div className="">
              <Image
                className="hidden h-14 w-auto dark:block"
                src={"/logo_inverse_horizontal.svg"}
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <Image
                className="h-16 w-auto dark:hidden"
                src={"/logo_horizontal.svg"}
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <h2 className="mt-10 text-left font-display text-2xl font-bold leading-9 tracking-tight">
                {(() => {
                  if (flow?.refresh) {
                    return "Confirm Action";
                  } else if (flow?.requested_aal === "aal2") {
                    return "Two-Factor Authentication";
                  }
                  return "Sign in to your Account";
                })()}
              </h2>
              {!aal && !refresh && (
                <p className="mt-2 text-sm/6 text-muted-foreground">
                  You don&apos;t have an Account?{" "}
                  <Link
                    href="/registration"
                    passHref
                    className="font-semibold hover:underline"
                  >
                    Sign up for free
                  </Link>
                </p>
              )}
            </div>
            <div className="mt-8">
              <Messages messages={flow?.ui.messages} />
            </div>
            <div className="mt-4 sm:mx-auto mt-8">
              {flow?.requested_aal !== "aal2" ? (
                <Tabs defaultValue="passwordless">
                  <TabsList>
                    <TabsTrigger value="passwordless">
                      Passwordless Login
                    </TabsTrigger>
                    <TabsTrigger value="password">
                      Legacy Password Login
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="passwordless" className={"mt-6"}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-md">
                          Passwordless Login
                        </CardTitle>
                        <CardDescription>
                          Use your passkey to sign in. If you do not have a
                          passkey, you can use the legacy password login option.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Flow
                          only="passkey"
                          hideGlobalMessages
                          onSubmit={onSubmit}
                          flow={flow as LoginFlow}
                        />
                        <p className="mt-4 text-sm/6 text-muted-foreground flex justify-end">
                          <Link
                            href="/recovery"
                            passHref
                            className="font-semibold hover:underline"
                          >
                            Need to recover your account?
                          </Link>
                        </p>
                        {availableMethods.includes("oidc") && (
                          <>
                            <div className="relative mt-6">
                              <div
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center"
                              >
                                <div className="w-full border-t border-muted-foreground/50" />
                              </div>
                              <div className="relative flex justify-center text-sm/6 font-medium">
                                <span className="px-6 text-muted-foreground bg-card">
                                  Or continue with
                                </span>
                              </div>
                            </div>
                            <div className="mt-6">
                              <Flow
                                className="flex flex-row flex-wrap gap-2 justify-center"
                                only="oidc"
                                hideGlobalMessages
                                onSubmit={onSubmit}
                                flow={flow as LoginFlow}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="password" className={"mt-6"}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-md">
                          Legacy Password Login
                        </CardTitle>
                        <CardDescription>
                          Passwords are insecure by design. We recommend using a
                          passwordless authentication methods.{" "}
                          <div className="mr-2 inline-block w-8">
                            <Carriage />
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Flow
                          only="password"
                          hideGlobalMessages
                          onSubmit={onSubmit}
                          flow={flow as LoginFlow}
                        />
                        <p className="mt-4 text-sm/6 text-muted-foreground flex justify-end">
                          <Link
                            href="/recovery"
                            passHref
                            className="font-semibold hover:underline"
                          >
                            Need to recover your account?
                          </Link>
                        </p>
                        {availableMethods.includes("oidc") && (
                          <>
                            <div className="relative mt-6">
                              <div
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center"
                              >
                                <div className="w-full border-t border-muted-foreground/50" />
                              </div>
                              <div className="relative flex justify-center text-sm/6 font-medium">
                                <span className="px-6 text-muted-foreground bg-card">
                                  Or continue with
                                </span>
                              </div>
                            </div>
                            <div className="mt-6">
                              <Flow
                                className="flex flex-row flex-wrap gap-2 justify-center"
                                only="oidc"
                                hideGlobalMessages
                                onSubmit={onSubmit}
                                flow={flow as LoginFlow}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Flow
                  only="totp"
                  hideGlobalMessages
                  onSubmit={onSubmit}
                  flow={flow as LoginFlow}
                />
              )}
            </div>
            <div className="mt-12 flex flex-col items-center">
              <p className="text-sm/6 text-muted-foreground text-center max-w-sm">
                By using DevGuard you agree to our{" "}
                <Link
                  href="https://devguard.org/terms-of-use"
                  target="_blank"
                  rel="noreferrer"
                  passHref
                  className="font-semibold hover:underline"
                >
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link
                  href="https://devguard.org/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  passHref
                  className="font-semibold hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {aal ||
              (refresh && (
                <a data-testid="logout-link" onClick={onLogout}>
                  Log out
                </a>
              ))}
          </div>
        </div>
        <ThreeJSFeatureScreen />
      </div>
    </>
  );
};

export default Login;
