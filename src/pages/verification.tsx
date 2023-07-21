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

import { VerificationFlow, UpdateVerificationFlowBody } from "@ory/client";

import { AxiosError } from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Flow } from "../components/kratos/Flow";
import { ory } from "../services/ory";
import Image from "next/image";

const Verification: NextPage = () => {
  const [flow, setFlow] = useState<VerificationFlow>();

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
        .getVerificationFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data);
        })
        .catch((err: AxiosError) => {
          switch (err.response?.status) {
            case 410:
            // Status code 410 means the request has expired - so let's load a fresh flow!
            case 403:
              // Status code 403 implies some other issue (e.g. CSRF) - let's reload!
              return router.push("/verification");
          }

          throw err;
        });
      return;
    }

    // Otherwise we initialize it
    ory
      .createBrowserVerificationFlow({
        returnTo: returnTo ? String(returnTo) : undefined,
      })
      .then(({ data }) => {
        setFlow(data);
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 400:
            // Status code 400 implies the user is already signed in
            return router.push("/");
        }

        throw err;
      });
  }, [flowId, router, router.isReady, returnTo, flow]);

  const onSubmit = async (values: UpdateVerificationFlowBody) => {
    await router
      // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
      // their data when they reload the page.
      .push(`/verification?flow=${flow?.id}`, undefined, { shallow: true });

    ory
      .updateVerificationFlow({
        flow: String(flow?.id),
        updateVerificationFlowBody: values,
      })
      .then(({ data }) => {
        // Form submission was successful, show the message to the user!
        setFlow(data);
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 400:
            // Status code 400 implies the form validation had an error
            //@ts-expect-error
            setFlow(err.response?.data);
            return;
          case 410:
            // @ts-expect-error
            const newFlowID = err.response.data.use_flow_id;
            router
              // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
              // their data when they reload the page.
              .push(`/verification?flow=${newFlowID}`, undefined, {
                shallow: true,
              });

            ory
              .getVerificationFlow({ id: newFlowID })
              .then(({ data }) => setFlow(data));
            return;
        }

        throw err;
      });
  };

  return (
    <>
      <Head>
        <title>Verify your account - Ory NextJS Integration Example</title>
        <meta name="description" content="NextJS + React + Vercel + Ory" />
      </Head>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 max-sm:py-16 py-32 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Image
            className="mx-auto h-16 w-auto"
            src="/logo_flaw_fix_white_l3.svg"
            alt="FlawFix by l3montree Logo"
            width={200}
            height={200}
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
            Verify your E-Mail
          </h2>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Flow onSubmit={onSubmit} flow={flow} />
        </div>
        <p className="mt-10 text-center text-sm">
          <Link
            href="/"
            passHref
            className="font-semibold leading-6 text-blue-500 hover:text-blue-400"
          >
            Go back
          </Link>
        </p>
      </div>
    </>
  );
};

export default Verification;
