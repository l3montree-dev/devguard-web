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

import { Alert, AlertTitle } from "@/components/ui/alert";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { Config, GitInstances } from "@/types/common";
import { CrownIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import CopyCode from "../common/CopyCode";
import { ImageZoom } from "../common/Zoom";
import YamlGenerator from "../guides/onboarding/YamlGenerator";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CarouselApi, CarouselItem } from "../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import DevguardTokenCard from "./DevguardTokenCard";

const GitlabTokenInstructions = () => {
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
            <div className="mb-4"></div>
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
  api,
  apiUrl,
  orgSlug,
  projectSlug,
  assetSlug,
  config,
}: {
  pat?: string;
  next?: () => void;
  prev?: () => void;
  api?: CarouselApi;
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  config: Config;
}) => {
  const [ready, setReady] = useState(true);
  const asset = useActiveAsset();

  useEffect(() => {
    api?.reInit();
  }, [api]);

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
          <Alert className="mt-5">
            <CrownIcon />
            <AlertTitle>
              You have to be at least <span className="">maintainer</span> to
              configure variables.
            </AlertTitle>
          </Alert>
        </DialogHeader>
        <div className="mt-5">
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
          <DevguardTokenCard />
        </div>
        <div className="flex mt-10 flex-row gap-2 justify-end">
          <Button variant={"secondary"} onClick={prev}>
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
            orgSlug={orgSlug}
            projectSlug={projectSlug}
            assetSlug={assetSlug}
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

export default GitlabTokenInstructions;
