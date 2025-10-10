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
"use client";
import {
  LoginFlow,
  RegistrationFlow,
  UiNodeScriptAttributes,
  UpdateRegistrationFlowBody,
} from "@ory/client";

import { Flow } from "@/components/kratos/Flow";
import { Messages } from "@/components/kratos/Messages";
import { Card, CardContent } from "@/components/ui/card";
import { filterNodesByGroups } from "@ory/integrations/ui";
import { AxiosError } from "axios";
import { uniq } from "lodash";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HTMLAttributeReferrerPolicy,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast, Toaster } from "sonner";
import ThreeJSFeatureScreen from "../../components/threejs/ThreeJSFeatureScreen";
import { useConfig } from "../../context/ConfigContext";
import { useSearchParams } from "next/navigation";
import { handleFlowError, ory } from "../../services/ory";
import { Checkbox } from "../../components/ui/checkbox";
import { useUpdateSession } from "../../context/SessionContext";

// Renders the registration page
const Registration = () => {
  const router = useRouter();

  const query = useSearchParams();

  const updateSession = useUpdateSession();
  const { oidcOnly, termsOfUseLink, privacyPolicyLink } = useConfig();
  const [oidcTermsOfUseAgreed, setOidcTermsOfUseAgreed] = useState(false);
  // The "flow" represents a registration process and contains
  // information about the form we need to render (e.g. username + password)
  const [flow, setFlow] = useState<RegistrationFlow>();

  // Get ?flow=... from the URL
  const { flow: flowId, return_to: returnTo } = query as {
    flow?: string;
    return_to?: string;
  };

  // In this effect we either initiate a new registration flow, or we fetch an existing registration flow.
  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (flow) {
      return;
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getRegistrationFlow({ id: String(flowId) })
        .then(({ data }) => {
          // We received the flow - let's use its data and render the form!
          setFlow(data);
        })
        .catch(handleFlowError(router, "registration", setFlow));
      return;
    }

    // Otherwise we initialize it
    ory
      .createBrowserRegistrationFlow({
        returnTo: returnTo ? String(returnTo) : undefined,
      })
      .then(({ data }) => {
        setFlow(data);
      })
      .catch(handleFlowError(router, "registration", setFlow));
  }, [flowId, router, returnTo, flow]);

  const onSubmit = async (values: UpdateRegistrationFlowBody) => {
    router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // his data when she/he reloads the page.
      .push(`/registration?flow=${flow?.id}`);

    ory
      .updateRegistrationFlow({
        flow: String(flow?.id),
        updateRegistrationFlowBody: values,
      })
      .then(async ({ data }) => {
        // If we ended up here, it means we are successfully signed up!
        //
        // You can do cool stuff here, like having access to the identity which just signed up:
        // console.log("This is the user session: ", data, data.identity);

        // continue_with is a list of actions that the user might need to take before the registration is complete.
        // It could, for example, contain a link to the verification form.
        updateSession({
          organizations: [],
          session: { identity: data.identity! },
        });

        if (data.continue_with) {
          for (const item of data.continue_with) {
            switch (item.action) {
              case "show_verification_ui":
                await router.push("/verification?flow=" + item.flow.id);
                return;
            }
          }
        }

        // If continue_with did not contain anything, we can just return to the home page.
        router.push(flow?.return_to || "/");
      })
      .catch(handleFlowError(router, "registration", setFlow))
      .catch((err: AxiosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          // Yup, it is!
          // @ts-expect-error
          setFlow(err.response?.data);
          return;
        }

        return Promise.reject(err);
      });
  };

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

  const availableMethods = useMemo(() => {
    return uniq(flow?.ui.nodes.map((node) => node.group));
  }, [flow?.ui.nodes]);

  return (
    <>
      <Head>
        <title>Create your DevGuard account</title>
        <meta name="description" content="Create your DevGuard account" />
      </Head>
      <div className="flex min-h-screen flex-1  flex-row bg-white ">
        <div className="flex w-2/5 bg-background flex-col items-center justify-center ">
          <div className="w-full px-8 xl:px-24">
            <div>
              <Image
                className="hidden h-20 w-auto dark:block"
                src="/logo_inverse_horizontal.svg"
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <Image
                className="h-20 w-auto dark:hidden"
                src="/logo_horizontal.svg"
                alt="DevGuard by l3montree Logo"
                width={300}
                height={300}
              />
              <h2 className="mt-10 text-left text-2xl font-bold leading-9 tracking-tight ">
                Create your DevGuard account
              </h2>
              <p className="mt-2 text-sm/6 text-muted-foreground">
                Already have an Account?{" "}
                <Link
                  data-testid="cta-link"
                  href="/login"
                  className="font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
            {flow?.ui.messages && (
              <div className="my-4">
                <Messages messages={flow?.ui.messages} />
              </div>
            )}

            <Card className="mt-10">
              <CardContent>
                <div className="mt-6 sm:mx-auto">
                  {!oidcOnly && Boolean(flow) && (
                    <div className="mb-6 border-b-2 pb-4">
                      <Flow
                        hideGlobalMessages
                        only="profile"
                        onSubmit={onSubmit}
                        flow={flow as LoginFlow}
                      />
                    </div>
                  )}

                  {availableMethods.includes("passkey") && (
                    <div className="mb-6 border-b-2 pb-4">
                      <Flow
                        hideGlobalMessages
                        only="passkey"
                        onSubmit={onSubmit}
                        flow={flow as LoginFlow}
                      />
                    </div>
                  )}
                  {availableMethods.includes("password") && (
                    <div className={"mt-6"}>
                      <Flow
                        hideGlobalMessages
                        only="password"
                        onSubmit={onSubmit}
                        flow={flow as LoginFlow}
                      />
                    </div>
                  )}
                </div>
                {availableMethods.includes("oidc") && (
                  <div className="mt-6">
                    <Flow
                      className="flex flex-row flex-wrap gap-2 justify-center"
                      only="oidc"
                      hideGlobalMessages
                      onSubmit={async (v) => {
                        if (!oidcTermsOfUseAgreed) {
                          toast.error(
                            "You must agree to the terms of use and privacy policy to continue.",
                          );
                          return;
                        }
                        return onSubmit(v as any);
                      }}
                      flow={flow as LoginFlow}
                    />
                    <div className="flex items-start gap-2 mt-4 flex-row">
                      <Checkbox
                        onCheckedChange={(v) =>
                          setOidcTermsOfUseAgreed(Boolean(v))
                        }
                      />
                      <span className="text-sm leading-4  block font-medium">
                        I agree to the{" "}
                        <a target="_blank" href={termsOfUseLink}>
                          terms of use
                        </a>{" "}
                        and the{" "}
                        <a
                          target="_blank"
                          className="whitespace-nowrap"
                          href={privacyPolicyLink}
                        >
                          privacy policy
                        </a>
                        .
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {!oidcOnly && Boolean(flow) && (
              <div className="flex flex-row justify-end">
                <span
                  onClick={async () => {
                    router.push("/registration");
                    setFlow(undefined);
                  }}
                  className="mt-4  cursor-pointer font-medium text-primary text-right block text-sm"
                >
                  Go back
                </span>
              </div>
            )}
          </div>
        </div>
        <ThreeJSFeatureScreen />
        <Toaster />
      </div>
    </>
  );
};

export default Registration;
