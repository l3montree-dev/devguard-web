// Copyright 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
import { useState } from "react";
import { toast } from "sonner";
import { useLoader } from "./useLoader";
import usePersonalAccessToken from "./usePersonalAccessToken";
import { useActiveOrg } from "./useActiveOrg";
import { useActiveAsset } from "./useActiveAsset";
import { useActiveProject } from "./useActiveProject";

// limitations under the License.
export function useAutosetup(scanType: "full" | "sca" | "container-scanning") {
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
  });

  const handleAutosetup = waitFor(() => {
    return new Promise<void>(async (resolve) => {
      // check if we already have a pat
      let privKey = pat?.privKey;
      if (!pat) {
        // create a new one for autosetup
        privKey = (await onCreatePat({ description: "SCA Analysis" })).privKey;
      }
      // set the progress to pending
      setProgress((prev) => {
        for (const key in prev) {
          prev[key as keyof typeof prev].status = "pending";
        }
        return { ...prev };
      });

      const resp = await browserApiClient(
        `/organizations/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}/integrations/gitlab/autosetup?scanType=${scanType}`,
        {
          method: "POST",
          body: JSON.stringify({
            devguardPrivateKey: privKey,
            devguardAssetName: `${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}`,
          }),
        },
      );

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
        resolve();
      } else {
        toast("Failed to setup GitLab integration");
      }
    });
  });

  return {
    handleAutosetup,
    progress,
    isLoading,
    Loader,
    pat,
    onCreatePat,
  };
}
