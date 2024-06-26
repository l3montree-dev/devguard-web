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
  UiNodeGroupEnum,
  UiNodeScriptAttributes,
  UpdateLoginFlowBody,
} from "@ory/client";

import { AxiosError } from "axios";
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
import { filterNodesByGroups } from "@ory/integrations/ui";
import { Tab } from "@headlessui/react";
import { classNames } from "@/utils/common";
import CustomTab from "@/components/common/CustomTab";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
import Callout from "@/components/common/Callout";
import Carriage from "@/components/common/Carriage";
import { Message, Messages } from "@/components/kratos/Messages";
import { uniq } from "lodash";

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
        <title>FlawFix - Sign in</title>
        <meta name="description" content="FlawFix Sign in" />
      </Head>
      <div className="flex min-h-screen flex-1 flex-row bg-white ">
        <div className="relative w-3/5 bg-slate-200 dark:bg-gray-500">
          <Image
            src={"/bg.png"}
            alt="FlawFix by l3montree Logo"
            objectFit="cover"
            fill
          />
        </div>
        <div className="flex w-2/5 flex-col items-center justify-center bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
          <div className="w-full px-8">
            <div className="">
              <Image
                className="hidden h-20 w-auto dark:block"
                src={"/logo_inverse_horizontal.svg"}
                alt="FlawFix by l3montree Logo"
                width={300}
                height={300}
              />
              <Image
                className="h-20 w-auto dark:hidden"
                src={"/logo_horizontal.svg"}
                alt="FlawFix by l3montree Logo"
                width={300}
                height={300}
              />
              <h2 className="font-display mt-10 text-left text-2xl font-bold leading-9 tracking-tight">
                {(() => {
                  if (flow?.refresh) {
                    return "Confirm Action";
                  } else if (flow?.requested_aal === "aal2") {
                    return "Two-Factor Authentication";
                  }
                  return "Sign In";
                })()}
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto">
              <Tab.Group>
                <CustomTab>Passwordless</CustomTab>
                <CustomTab>Legacy Password login</CustomTab>
                <Tab.Panels className={"mt-6"}>
                  <Tab.Panel>
                    <Flow
                      only="webauthn"
                      hideGlobalMessages
                      onSubmit={onSubmit}
                      flow={flow as LoginFlow}
                    />
                    {availableMethods.includes("oidc") && (
                      <div className="mt-6 border-t pt-6 dark:border-t-gray-800">
                        <div className="flex flex-row items-center justify-end gap-4">
                          <span className="text-sm text-gray-400">
                            Social-Login
                          </span>
                          <Flow
                            only="oidc"
                            hideGlobalMessages
                            onSubmit={onSubmit}
                            flow={flow as LoginFlow}
                          />
                        </div>
                      </div>
                    )}
                  </Tab.Panel>
                  <Tab.Panel>
                    <div className="my-4">
                      <Callout intent="warning">
                        <div className="flex flex-row gap-4">
                          <p className="flex-1">
                            Passwords are insecure by design. We recommend using
                            a passwordless authentication methods.{" "}
                            <div className="mr-2 inline-block w-10">
                              <Carriage />
                            </div>
                          </p>
                        </div>
                      </Callout>
                    </div>
                    <Flow
                      only="password"
                      hideGlobalMessages
                      onSubmit={onSubmit}
                      flow={flow as LoginFlow}
                    />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
            <div className="mt-4">
              <Messages messages={flow?.ui.messages} />
            </div>

            {aal || refresh ? (
              <a data-testid="logout-link" onClick={onLogout}>
                Log out
              </a>
            ) : (
              <>
                <p className="mt-10 text-left text-sm">
                  You do not have an Account?{" "}
                  <Link
                    href="/registration"
                    passHref
                    className="font-semibold leading-6 text-blue-600 hover:text-blue-400"
                  >
                    Create account
                  </Link>
                </p>

                <p className="mt-4 text-left text-sm">
                  Forgot password?{" "}
                  <Link
                    href="/recovery"
                    passHref
                    className="font-semibold leading-6 text-blue-600 hover:text-blue-400"
                  >
                    Recover your account
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
