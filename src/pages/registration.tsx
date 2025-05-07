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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

  return (
    <>
      <div>
        <div className="flex min-h-screen flex-1 flex-row bg-secondary ">
          <div className="relative w-2/5 bg-slate-200 dark:bg-yellow-400">
            <div className="flex justify-center items-center h-screen">

              
              {/* <Image
                src="/assets/supply_chain.png"
                width={300}
                height={300}
                alt="meddle"
              ></Image> */}
            </div>
          </div>

          <div className="flex-1 flex-row justify-center self-center items-center bg-secondary">
            <Card className="m-10 rounded-3xl">
              <CardHeader>
                <div className="mb-2">
                  <Image
                    className="hidden h-10 w-auto dark:block "
                    src="/logo_inverse_horizontal.svg"
                    alt="DevGuard by l3montree Logo"
                    width={300}
                    height={300}
                  />
                  <Image
                    className="h-10 w-auto dark:hidden"
                    src="/logo_horizontal.svg"
                    alt="DevGuard by l3montree Logo"
                    width={300}
                    height={300}
                  />
                </div>

                <CardTitle className="text-4xl">Sign In</CardTitle>
                <CardDescription>W3lcome back!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <form>
                    <div className="flex justify-end">
                      <div className="grid w-full gap-4 ">
                        <div className="flex items-end">
                          <Input
                            id="name"
                            placeholder="Your@E-Mail.com"
                          ></Input>
                          <div className="w-px h-8 bg-secondary mx-4 mt-1"/>
                          <div className="flex">
                            <Button variant="default">
                              <Image
                                src="/assets/github.svg"
                                alt="GitHub"
                                width={30}
                                height={30}
                                className="inline-block dark:"
                              />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="framework">
                            Forgot your E-Mail Adresse?
                          </Label>
                          <div className="flex flex-row w-1/2">
                            <div className="grid grid-cols-3 gap-4 opacity-50">
                              <hr className="" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end ">
                <Button className="" variant="ghost">
                  Create Account
                </Button>
                <div className="m-2"></div>
                <Button variant="default">Continue</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Registration;
