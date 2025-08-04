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

import { RecoveryFlow, UpdateRecoveryFlowBody } from "@ory/client";

import { AxiosError } from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Flow } from "../components/kratos/Flow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { handleFlowError, ory } from "../services/ory";
import { Button } from "../components/ui/button";
import Image from "next/image";

const Recovery: NextPage = () => {
  const [flow, setFlow] = useState<RecoveryFlow>();

  // Get ?flow=... from the URL
  const router = useRouter();
  const { flow: flowId, return_to: returnTo } = router.query;

  useEffect(() => {
    // If the router is not ready yet, or we already have a flow, do nothing.
    if (!router.isReady || flow) {
      return;
    }

    // If ?flow=.. was in the URL, we fetch it
    if (flowId) {
      ory
        .getRecoveryFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data);
        })
        .catch(handleFlowError(router, "recovery", setFlow));
      return;
    }

    // Otherwise we initialize it
    ory
      .createBrowserRecoveryFlow({
        returnTo: String(returnTo || ""),
      })
      .then(({ data }) => {
        setFlow(data);
      })
      .catch(handleFlowError(router, "recovery", setFlow))
      .catch((err: AxiosError) => {
        // If the previous handler did not catch the error it's most likely a form validation error
        if (err.response?.status === 400) {
          // Yup, it is!
          //@ts-expect-error
          setFlow(err.response?.data);
          return;
        }

        return Promise.reject(err);
      });
  }, [flowId, router, router.isReady, returnTo, flow]);

  const onSubmit = (values: UpdateRecoveryFlowBody) =>
    router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // his data when she/he reloads the page.
      .push(`/recovery?flow=${flow?.id}`, undefined, { shallow: true })
      .then(() =>
        ory
          .updateRecoveryFlow({
            flow: String(flow?.id),
            updateRecoveryFlowBody: values,
          })
          .then(({ data }) => {
            // Form submission was successful, show the message to the user!
            setFlow(data);
          })
          .catch(handleFlowError(router, "recovery", setFlow))
          .catch((err: AxiosError) => {
            switch (err.response?.status) {
              case 400:
                // Status code 400 implies the form validation had an error
                //@ts-expect-error
                setFlow(err.response?.data);
                return;
            }

            throw err;
          }),
      );

  return (
    <>
      <Head>
        <title>Recover your account</title>
      </Head>
      <div className="flex min-h-screen flex-1 flex-col justify-center  px-6 py-32 max-sm:py-16 lg:px-8">
        <Card className="sm:mx-auto sm:w-full sm:max-w-lg">
          <CardHeader>
            <CardTitle>Recover your account</CardTitle>
            <CardDescription>
              Enter your email address to receive a recovery link.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Image
              src="/assets/gopher-lost-keys.png"
              alt="A gopher that has lost its keys"
              width={200}
              height={200}
              className="mx-auto mb-4 h-26 w-auto dark:block"
            />
            <div className="sm:mx-auto sm:w-full sm:max-w-lg">
              <Flow onSubmit={onSubmit} flow={flow} />
            </div>
            <div className="mt-4 flex flex-row justify-end text-sm">
              <Link href="/">
                <Button variant={"outline"}>Go back</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Recovery;
