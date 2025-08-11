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
// limitations under the License.
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import CopyCode, { CopyCodeFragment } from "../common/CopyCode";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { integrationSnippets } from "../../integrationSnippets";
import { ImageZoom } from "../common/Zoom";
import router from "next/router";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "sonner";
import YamlGenerator from "../onboarding/YamlGenerator";
import { Config, GitInstances } from "@/types/common";

const GithubTokenInstructions = ({ pat }: { pat?: string }) => {
  const asset = useActiveAsset();
  return (
    <>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">
          Open the project settings in GitHub
        </h3>
        <small className="text-muted-foreground">
          For example, for the DevGuard project its following url:
          https://github.com/l3montree-dev/devguard/settings
        </small>
        <div className="relative aspect-video w-full max-w-4xl">
          <ImageZoom
            alt="Open the project settings in GitHub"
            className="rounded-lg border object-fill"
            src={"/assets/project-settings.png"}
            fill
          />
        </div>
      </div>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">
          Navigate to Secrets and Variables and choose actions
          <br />
          Press the button {"<"}New repository secret{">"}
        </h3>
        <small className="text-muted-foreground">
          For example, for the DevGuard project its following url:
          https://github.com/l3montree-dev/devguard/settings/secrets/actions
        </small>
        <div className="relative aspect-video w-full max-w-4xl">
          <ImageZoom
            alt="Open the project settings in GitHub"
            className="rounded-lg border object-fill"
            src={"/assets/repo-secret.png"}
            fill
          />
        </div>
      </div>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">Create a new secret</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <span className="mb-2 block text-sm font-semibold">Name</span>
              <CopyCode language="shell" codeString={`DEVGUARD_TOKEN`} />
            </div>
            <div className="mb-4">
              <span className="mb-2 block text-sm font-semibold">Secret</span>
              <CopyCode
                language="shell"
                codeString={pat ?? "<PERSONAL ACCESS TOKEN>"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export const GithubTokenSlides = ({
  gitInstances,
  pat,
  next,
  prev,
  onPatGenerate,
  apiUrl,
  api,
  orgSlug,
  projectSlug,
  config,
}: {
  gitInstances: GitInstances;
  pat?: string;
  next?: () => void;
  prev?: () => void;
  onPatGenerate: () => void;
  api?: CarouselApi;
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  config: Config;
}) => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const assetVersion = useActiveAssetVersion();
  const asset = useActiveAsset();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    api?.reInit();
  }, []);

  return (
    <>
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>
            Navigate to Settings &gt; Secrets and Variables &gt; Actions. Press
            the button &quot;New repository secret&quot;
          </DialogTitle>
          <DialogDescription>
            For example, for the DevGuard project its following url:
            https://github.com/l3montree-dev/devguard/settings/secrets/actions
          </DialogDescription>
        </DialogHeader>
        <div className="mt-10">
          <div
            className="relative aspect-video w-full
            max-w-4xl"
          >
            <ImageZoom
              alt="Open the project settings in GitHub"
              className="rounded-lg border object-fill"
              src={"/assets/repo-secret.png"}
              fill
            />
          </div>
        </div>

        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Create a new secret</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="mb-2 block text-sm font-semibold">Name</span>
                <CopyCode language="shell" codeString={`DEVGUARD_TOKEN`} />
              </div>
              <div className="mb-4">
                <span className="mb-2 block text-sm font-semibold">Secret</span>
                <CopyCode
                  language="shell"
                  codeString={pat ?? "<PERSONAL ACCESS TOKEN>"}
                />
              </div>
              <div className="flex flex-row justify-end">
                <Button onClick={onPatGenerate} variant={"secondary"}>
                  Generate personal access token
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex mt-10 flex-row gap-2 justify-end">
          <Button variant={"secondary"} onClick={() => prev?.()}>
            Back
          </Button>
          <Button
            onClick={() => {
              next?.();
              setReady(true);
            }}
          >
            Continue
          </Button>
        </div>
      </CarouselItem>
      {ready && (
        <CarouselItem>
          <YamlGenerator
            gitInstance={
              asset?.repositoryProvider === "github" ? "GitHub" : "Gitlab"
            }
            apiUrl={apiUrl}
            orgSlug={activeOrg.slug}
            projectSlug={activeProject.slug}
            assetSlug={asset!.slug}
            onPatGenerate={onPatGenerate}
            pat={pat}
            prev={prev}
            next={next}
            api={api}
            config={config}
          ></YamlGenerator>
        </CarouselItem>
      )}
    </>
  );
};

export default GithubTokenInstructions;
