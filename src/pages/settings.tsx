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

import { AxiosError } from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { Flow, Methods } from "../components/kratos/Flow";
import { Messages } from "../components/kratos/Messages";
import { ory, handleFlowError } from "../services/ory";
import Image from "next/image";

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

const Settings: NextPage = () => {
  const [flow, setFlow] = useState<SettingsFlow>();

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
      .push(`/settings?flow=${flow?.id}`, undefined, { shallow: true })
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
                    //@ts-expect-error
                    router.push("/verification?flow=" + item.flow.id);
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

  return (
    <>
      <Head>
        <title>Profile Management and Security Settings</title>
        <meta name="description" content="NextJS + React + Vercel + Ory" />
      </Head>
      <div className="divide-y divide-white/5 bg-gray-900">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">
              Profile Management & Security Settings
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Use a permanent address where you can receive mail.
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full flex items-center gap-x-8">
                <Image
                  src="/examples/tim.jpg"
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover"
                />
                <div>
                  <button
                    type="button"
                    className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                  >
                    Change avatar
                  </button>
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>

              <div className="col-span-full">
                <SettingsCard only="profile" flow={flow}>
                  <Messages messages={flow?.ui.messages} />
                  <Flow
                    hideGlobalMessages
                    onSubmit={onSubmit}
                    only="profile"
                    flow={flow}
                  />
                </SettingsCard>
              </div>
            </div>
          </div>
        </div>
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">
              Change password
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Update your password associated with your account.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full">
                <SettingsCard only="password" flow={flow}>
                  <Messages messages={flow?.ui.messages} />
                  <Flow
                    hideGlobalMessages
                    onSubmit={onSubmit}
                    only="password"
                    flow={flow}
                  />
                </SettingsCard>
              </div>
            </div>
          </div>
        </div>
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">
              Manage Social Sign In
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Update your password associated with your account.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full">
                <SettingsCard only="oidc" flow={flow}>
                  <Messages messages={flow?.ui.messages} />
                  <Flow
                    hideGlobalMessages
                    onSubmit={onSubmit}
                    only="oidc"
                    flow={flow}
                  />
                </SettingsCard>
              </div>
            </div>
          </div>
        </div>
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">
              Manage 2FA Backup Recovery Codes
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Recovery codes can be used in panic situations where you have lost
              access to your 2FA device.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full">
                <SettingsCard only="lookup_secret" flow={flow}>
                  <Messages messages={flow?.ui.messages} />
                  <Flow
                    hideGlobalMessages
                    onSubmit={onSubmit}
                    only="lookup_secret"
                    flow={flow}
                  />
                </SettingsCard>
              </div>
            </div>
          </div>
        </div>
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">
              Manage 2FA TOTP Authenticator App
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Add a TOTP Authenticator App to your account to improve your
              account security. Popular Authenticator Apps are{" "}
              <a
                href="https://www.lastpass.com"
                rel="noreferrer"
                target="_blank"
                className="text-blue-500 hover:text-blue-400"
              >
                LastPass
              </a>{" "}
              and Google Authenticator (
              <a
                href="https://apps.apple.com/us/app/google-authenticator/id388497605"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:text-blue-400"
              >
                iOS
              </a>
              ,{" "}
              <a
                href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:text-blue-400"
              >
                Android
              </a>
              ).
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full">
                <SettingsCard only="totp" flow={flow}>
                  <Messages messages={flow?.ui.messages} />
                  <Flow
                    hideGlobalMessages
                    onSubmit={onSubmit}
                    only="totp"
                    flow={flow}
                  />
                </SettingsCard>
              </div>
            </div>
          </div>
        </div>
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">
              Manage Hardware Tokens and Biometrics
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Use Hardware Tokens (e.g. YubiKey) or Biometrics (e.g. FaceID,
              TouchID) to enhance your account security.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full">
                <SettingsCard only="webauthn" flow={flow}>
                  <Messages messages={flow?.ui.messages} />
                  <Flow
                    hideGlobalMessages
                    onSubmit={onSubmit}
                    only="webauthn"
                    flow={flow}
                  />
                </SettingsCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
