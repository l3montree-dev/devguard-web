import { SettingsFlow, UpdateSettingsFlowBody } from "@ory/client";

import { AxiosError } from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { Flow, Methods } from "../components/Flow";
import { Messages } from "../components/Messages";
import { ory, handleFlowError } from "../services/ory";

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
        <title>
          Profile Management and Security Settings - Ory NextJS Integration
          Example
        </title>
        <meta name="description" content="NextJS + React + Vercel + Ory" />
      </Head>
      Profile Management and Security Settings
      <SettingsCard only="profile" flow={flow}>
        <h3>Profile Settings</h3>
        <Messages messages={flow?.ui.messages} />
        <Flow
          hideGlobalMessages
          onSubmit={onSubmit}
          only="profile"
          flow={flow}
        />
      </SettingsCard>
      <SettingsCard only="password" flow={flow}>
        <h3>Change Password</h3>

        <Messages messages={flow?.ui.messages} />
        <Flow
          hideGlobalMessages
          onSubmit={onSubmit}
          only="password"
          flow={flow}
        />
      </SettingsCard>
      <SettingsCard only="oidc" flow={flow}>
        <h3>Manage Social Sign In</h3>

        <Messages messages={flow?.ui.messages} />
        <Flow hideGlobalMessages onSubmit={onSubmit} only="oidc" flow={flow} />
      </SettingsCard>
      <SettingsCard only="lookup_secret" flow={flow}>
        <h3>Manage 2FA Backup Recovery Codes</h3>
        <Messages messages={flow?.ui.messages} />
        <p>
          Recovery codes can be used in panic situations where you have lost
          access to your 2FA device.
        </p>

        <Flow
          hideGlobalMessages
          onSubmit={onSubmit}
          only="lookup_secret"
          flow={flow}
        />
      </SettingsCard>
      <SettingsCard only="totp" flow={flow}>
        <h3>Manage 2FA TOTP Authenticator App</h3>
        <p>
          Add a TOTP Authenticator App to your account to improve your account
          security. Popular Authenticator Apps are{" "}
          <a href="https://www.lastpass.com" rel="noreferrer" target="_blank">
            LastPass
          </a>{" "}
          and Google Authenticator (
          <a
            href="https://apps.apple.com/us/app/google-authenticator/id388497605"
            target="_blank"
            rel="noreferrer"
          >
            iOS
          </a>
          ,{" "}
          <a
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US"
            target="_blank"
            rel="noreferrer"
          >
            Android
          </a>
          ).
        </p>
        <Messages messages={flow?.ui.messages} />
        <Flow hideGlobalMessages onSubmit={onSubmit} only="totp" flow={flow} />
      </SettingsCard>
      <SettingsCard only="webauthn" flow={flow}>
        <h3>Manage Hardware Tokens and Biometrics</h3>
        <Messages messages={flow?.ui.messages} />
        <p>
          Use Hardware Tokens (e.g. YubiKey) or Biometrics (e.g. FaceID,
          TouchID) to enhance your account security.
        </p>
        <Flow
          hideGlobalMessages
          onSubmit={onSubmit}
          only="webauthn"
          flow={flow}
        />
      </SettingsCard>
      <Link href="/" passHref>
        Go back
      </Link>
    </>
  );
};

export default Settings;
