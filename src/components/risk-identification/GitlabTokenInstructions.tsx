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
// limitations under the License.

import React from "react";
import Image from "next/image";
import CopyCode, { CopyCodeFragment } from "../common/CopyCode";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CarouselItem } from "../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { integrationSnippets } from "../../integrationSnippets";
import { ImageZoom } from "../common/Zoom";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import router from "next/router";
import { toast } from "sonner";

const GitlabTokenInstructions = ({ pat }: { pat?: string }) => {
  return (
    <>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">
          Open the CI/CD project settings in GitLab
        </h3>
        <small className="text-muted-foreground">
          It looks something like this:
          https://gitlab.com/l3montree/example-project/-/settings/ci_cd
        </small>
        <div className="relative mt-2 aspect-video w-full max-w-4xl">
          <Image
            alt="Open the project settings in Gitlab"
            className="rounded-lg border object-fill"
            src={"/assets/gitlab-project-settings.png"}
            fill
          />
        </div>
      </div>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">
          Scroll down to Variables section and click on &quot;Expand&quot;
          <br />
          Press the button {"<"}Add variable{">"}
        </h3>

        <div className="relative mt-2 aspect-video w-full max-w-4xl">
          <ImageZoom
            alt="Open the project settings in Gitlab"
            className="rounded-lg border object-fill"
            src={"/assets/gitlab-secret.png"}
            fill
          />
        </div>
      </div>
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">Create a new variable</h3>
        <div className="relative mt-2 aspect-video w-full max-w-4xl">
          <ImageZoom
            alt="Open the project settings in Gitlab"
            className="rounded-lg border object-fill"
            src={"/assets/gitlab-var-settings.png"}
            fill
          />
        </div>
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="mb-4">
              <span className="mb-2 block text-sm font-semibold">Key</span>
              <CopyCode language="shell" codeString={`DEVGUARD_TOKEN`} />
            </div>
            <div className="mb-4">
              <span className="mb-2 block text-sm font-semibold">Value</span>
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

export const GitlabTokenSlides = ({
  pat,
  next,
  prev,
  scanner,
  onPatGenerate,
  apiUrl,
  orgSlug,
  projectSlug,
  assetSlug,
}: {
  pat?: string;
  next?: () => void;
  prev?: () => void;
  onPatGenerate: () => void;
  scanner?:
    | "secret-scanning"
    | "iac"
    | "sast"
    | "custom"
    | "devsecops"
    | "container-scanning"
    | "sca";
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
}) => {
  const codeString = integrationSnippets({
    orgSlug,
    projectSlug,
    assetSlug,
    apiUrl,
  })["Gitlab"][scanner ?? "devsecops"];



  return (
    <>
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>
            Navigate to CI/CD Settings &gt; Variables &gt; Expand. Press the
            button &quot;Add variable&quot;
          </DialogTitle>
          <DialogDescription>
            For example, for the DevGuard project its following URL:
            https://gitlab.com/l3montree/example-project/-/settings/ci_cd
          </DialogDescription>
        </DialogHeader>
        <div className="mt-10">
          <div className="relative aspect-video w-full max-w-4xl">
            <ImageZoom
              alt="Open the CI/CD settings in GitLab"
              className="rounded-lg border object-fill"
              src={"/assets/gitlab-secret.png"}
              fill
            />
          </div>
        </div>

        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Create a new variable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="mb-2 block text-sm font-semibold">Key</span>
                <CopyCode language="shell" codeString={`DEVGUARD_TOKEN`} />
              </div>
              <div className="mb-4">
                <span className="mb-2 block text-sm font-semibold">Value</span>
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
          <Button variant={"secondary"} onClick={prev}>
            Back
          </Button>
          <Button onClick={next}>Continue</Button>
        </div>
      </CarouselItem>
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>Add the snippet to your GitLab CI/CD File</DialogTitle>
          <DialogDescription>
            Create a new <CopyCodeFragment codeString=".gitlab-ci.yml" /> file
            or add the code snippet to an existing CI/CD configuration file.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-10">
          <CopyCode codeString={codeString} language="yaml" />
        </div>
        <div className="flex mt-10 flex-row gap-2 justify-end">
          <Button variant={"secondary"} onClick={prev}>
            Back
          </Button>
          <Button
            onClick={() => {
              toast.error(
                "Devguard has not recieved your data yet, make sure you have implemented the CI/CD Pipeline Action",
              );
              router.push(
                `/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}?path=/dependency-risks`,
              );
            }}
          >
            Done!
          </Button>
        </div>
      </CarouselItem>
    </>
  );
};

export default GitlabTokenInstructions;
