// Copyright 2024 Tim Bastin, l3montree GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and

import { browserApiClient } from "@/services/devGuardApi";
import { PatWithPrivKey } from "@/types/api/api";
import { once } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useActiveAsset } from "./useActiveAsset";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveProject } from "./useActiveProject";
import { useLoader } from "./useLoader";
import usePersonalAccessToken from "./usePersonalAccessToken";

// limitations under the License.
export function useAutosetup(
  devguardApiUrl: string,
  scanner:
    | "full"
    | "sca"
    | "container-scanning"
    | "secret-scanning"
    | "iac"
    | "sast",
) {
  const { waitFor, isLoading, Loader } = useLoader();
  const { personalAccessTokens, onCreatePat } = usePersonalAccessToken();
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const asset = useActiveAsset();

  const pat =
    personalAccessTokens.length > 0
      ? (personalAccessTokens[0] as PatWithPrivKey)
      : undefined;

  const [progress, setProgress] = useState<{
    [key: string]: {
      status: "notStarted" | "pending" | "success";
      message: string;
      url?: string;
    };
  }>({
    projectHook: {
      status: "notStarted",
      message: "Project Webhook is created",
    },
    projectVariables: {
      status: "notStarted",
      message:
        "Project variables (DEVGUARD_TOKEN, DEVGUARD_ASSET_NAME) are created",
    },
    pipeline: {
      status: "notStarted",
      message:
        "The pipeline is created. A new branch was pushed to the repository",
    },
    mergeRequest: {
      url: undefined,
      status: "notStarted",
      message: "A merge request is created",
    },
    ...(asset?.externalEntityProviderId && {
      inviteDevguardBot: {
        status: "notStarted",
        message:
          "DevGuard Bot is invited to the project (only required for GitLab/ openCode)",
      },
    }),
  });

  const handleAutosetup = waitFor<boolean, void>((pendingAutosetup = false) => {
    // check if the asset is an external entity
    if (asset?.externalEntityProviderId && !pendingAutosetup) {
      // we need to redirect the user to authorize the "autosetup" oauth2 application
      sessionStorage.setItem("pending-autosetup", "true");
      window.location.href =
        window.location.origin +
        "/api/devguard-tunnel/api/v1/oauth2/gitlab/" +
        asset.externalEntityProviderId.replace("@", "") +
        "autosetup?redirectTo=" +
        encodeURIComponent(window.location.href);

      return Promise.resolve();
    }

    return new Promise<void>(async (resolve) => {
      // create a new one for autosetup
      const privKey = (
        await onCreatePat({
          description: "DevGuard Autosetup (used inside GitLab Pipeline)",
          scopes: "scan",
        })
      ).privKey;

      // set the progress to pending
      setProgress((prev) => {
        for (const key in prev) {
          prev[key as keyof typeof prev].status = "pending";
        }
        return { ...prev };
      });

      let url = `/organizations/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}/integrations/gitlab/autosetup?scanner=${scanner}`;

      if (asset?.externalEntityProviderId) {
        url =
          url +
          `&providerId=${activeOrg.externalEntityProviderId?.replace("@", "")}autosetup`;
      }

      const resp = await browserApiClient(url, {
        method: "POST",
        body: JSON.stringify({
          devguardPrivateKey: privKey,
          devguardAssetName: `${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}`,
          devguardApiUrl: devguardApiUrl,
        }),
      });

      if (resp.ok && resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          // parse the json
          const data = JSON.parse(chunk);
          if ("url" in data) {
            window.open(data.url, "_blank");
          }
          setProgress((prev) => {
            prev[data.step as keyof typeof prev] = {
              ...data,
              message: prev[data.step as keyof typeof prev].message,
            };
            return { ...prev };
          });
        }
        sessionStorage.removeItem("pending-autosetup");
        resolve();
      } else {
        sessionStorage.removeItem("pending-autosetup");
        toast("Failed to setup GitLab integration");
      }
    });
  });

  const autosetupOnce = useCallback(once(handleAutosetup), []);

  useEffect(() => {
    // check for pending autosetup - if so, we should be able to continue
    if (sessionStorage.getItem("pending-autosetup")) {
      autosetupOnce(true);
    }
  }, []);

  return {
    handleAutosetup,
    progress,
    isLoading,
    Loader,
    pat,
    onCreatePat,
  };
}
