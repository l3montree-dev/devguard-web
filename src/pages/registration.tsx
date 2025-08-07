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
  RegistrationFlow,
  UiNodeGroupEnum,
  UiNodeScriptAttributes,
  UpdateRegistrationFlowBody,
} from "@ory/client";

import { Flow } from "@/components/kratos/Flow";
import { filterNodesByGroups } from "@ory/integrations/ui";
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
import { handleFlowError, ory } from "../services/ory";
import { Messages } from "@/components/kratos/Messages";
import ThreeJSFeatureScreen from "../components/threejs/ThreeJSFeatureScreen";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { uniq } from "lodash";

// Renders the registration page
const Registration: NextPage = () => {
  const router = useRouter();

  // The "flow" represents a registration process and contains
  // information about the form we need to render (e.g. username + password)
  const [flow, setFlow] = useState<RegistrationFlow>();

  // Get ?flow=... from the URL
  const { flow: flowId, return_to: returnTo } = router.query;

  // In this effect we either initiate a new registration flow, or we fetch an existing registration flow.
  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (!router.isReady || flow) {
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
  }, [flowId, router, router.isReady, returnTo, flow]);

  const onSubmit = async (values: UpdateRegistrationFlowBody) => {
    await router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // his data when she/he reloads the page.
      .push(`/registration?flow=${flow?.id}`, undefined, { shallow: true });

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
        await router.push(flow?.return_to || "/");
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

  const hasSignupWithPasskey = useMemo(() => {
    return (
      (flow?.ui.nodes.filter((n) => n.group === UiNodeGroupEnum.Passkey)
        .length ?? 0) > 0
    );
  }, [flow]);

  const availableMethods = useMemo(() => {
    return uniq(flow?.ui.nodes.map((node) => node.group));
  }, [flow?.ui.nodes]);

  return (
    <>
      <Head>
        <title>Create your DevGuard account</title>
        <meta name="description" content="NextJS + React + Vercel + Ory" />
      </Head>
      <div className="flex min-h-screen flex-1  flex-row bg-white ">
        <div className="flex w-4/5 bg-background flex-col items-center justify-center ">
          <div className="w-full px-26">
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

            <Card className="mt-10">
              <CardContent>
                <div className="mt-6 mb-8 sm:mx-auto">
                  {hasSignupWithPasskey && (
                    <div className={"mb-4"}>
                      <div className="mb-4 border-b-2 pb-4">
                        <Flow
                          only="passkey"
                          onSubmit={onSubmit}
                          flow={flow as LoginFlow}
                        />
                      </div>
                      <div></div>
                      <Flow
                        hideGlobalMessages
                        only="password"
                        onSubmit={onSubmit}
                        flow={flow as LoginFlow}
                      />
                    </div>
                  )}
                  <Flow
                    hideGlobalMessages
                    only="profile"
                    onSubmit={onSubmit}
                    flow={flow as LoginFlow}
                  />
                </div>
                {availableMethods.includes("oidc") && (
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
                )}
                <div className="mt-6">
                  <Flow
                    className="flex flex-row flex-wrap gap-2 justify-center"
                    only="oidc"
                    hideGlobalMessages
                    onSubmit={onSubmit}
                    flow={flow as LoginFlow}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <ThreeJSFeatureScreen />
      </div>
    </>
  );
};

export default Registration;
