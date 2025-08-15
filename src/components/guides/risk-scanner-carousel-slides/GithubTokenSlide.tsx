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

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { Config } from "@/types/common";
import { useState } from "react";
import { Button } from "../../ui/button";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import CopyCode from "../../common/CopyCode";
import { ImageZoom } from "../../common/Zoom";
import DevguardTokenCard from "../../risk-identification/DevguardTokenCard";

interface GithubTokenSlideProps {
  pat?: string;
  api?: {
    scrollTo: (index: number) => void;
  };
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  config: Config;
}

const GithubTokenSlide = ({
  pat,
  api,
  apiUrl,
  orgSlug,
  projectSlug,
  assetSlug,
  config,
}: GithubTokenSlideProps) => {
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const asset = useActiveAsset();

  const [ready, setReady] = useState(false);

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Navigate to Settings &gt; Secrets and Variables &gt; Actions. Press
          the button &quot;New repository secret&quot;
        </DialogTitle>
        <DialogDescription>
          You need to add the DevGuard token as a secret to your GitHub
          repository.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-10">
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
          </h3>
          <div className="relative aspect-video w-full max-w-4xl">
            <ImageZoom
              alt="Navigate to Secrets and Variables and choose actions"
              className="rounded-lg border object-fill"
              src={"/assets/repo-secret.png"}
              fill
            />
          </div>
        </div>

        <DevguardTokenCard />

        <div className="mb-10">
          <h3 className="mb-4 mt-2 font-semibold">
            Create a new repository secret called DEVGUARD_TOKEN
          </h3>
          <CopyCode codeString={pat || "Loading..."} />
        </div>
      </div>

      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button variant="secondary" onClick={() => api?.scrollTo(3)}>
          Back
        </Button>
        <Button disabled={!ready} onClick={() => api?.scrollTo(5)}>
          Continue
        </Button>
      </div>
    </CarouselItem>
  );
};

export default GithubTokenSlide;
