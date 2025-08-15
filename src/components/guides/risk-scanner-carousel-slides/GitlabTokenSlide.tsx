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
import { Config } from "@/types/common";
import { CrownIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import CopyCode from "../../common/CopyCode";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import DevguardTokenCard from "../../risk-identification/DevguardTokenCard";

interface GitlabTokenSlideProps {
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

const GitlabTokenSlide = ({
  pat,
  api,
  apiUrl,
  orgSlug,
  projectSlug,
  assetSlug,
  config,
}: GitlabTokenSlideProps) => {
  const asset = useActiveAsset();
  const [ready, setReady] = useState(false);

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Navigate to your project Settings &gt; CI/CD &gt; Variables
        </DialogTitle>
        <DialogDescription>
          You need to add the DevGuard token as a variable to your GitLab
          project.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-10">
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
            Expand the &quot;Variables&quot; section
          </h3>
          <small className="text-muted-foreground">
            Expand the &quot;Variables&quot; section and click on &quot;Add
            variable&quot;
          </small>
          <div className="relative mt-2 aspect-video w-full max-w-4xl">
            <Image
              alt="Navigate to Variables and choose actions"
              className="rounded-lg border object-fill"
              src={"/assets/gitlab-var-settings.png"}
              fill
            />
          </div>
        </div>

        <DevguardTokenCard />

        <div className="mb-10">
          <h3 className="mb-4 mt-2 font-semibold">
            Add a new variable called DEVGUARD_TOKEN
          </h3>
          <small className="text-muted-foreground">
            Make sure to mark it as &quot;Masked&quot; and optionally
            &quot;Protected&quot; if you want to use it only on protected
            branches.
          </small>
        </div>

        <Alert className="mb-4">
          <CrownIcon className="h-4 w-4" />
          <AlertTitle>
            Make sure that the visibility of your project is set to
            &quot;Private&quot; or higher.
          </AlertTitle>
        </Alert>
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

export default GitlabTokenSlide;
