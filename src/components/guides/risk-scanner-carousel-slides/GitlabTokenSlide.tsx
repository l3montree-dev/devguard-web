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
import { Config } from "@/types/common";
import { CrownIcon } from "lucide-react";
import { ImageZoom } from "../../common/Zoom";
import DevguardTokenCard from "../../DevguardTokenCard";
import { Button } from "../../ui/button";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { useTheme } from "next-themes";

interface GitlabTokenSlideProps {
  pat?: string;
  api?: {
    scrollTo: (index: number) => void;
  };
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  yamlGeneratorSlideIndex: number;
  config: Config;
  prevIndex: number;
}

const GitlabTokenSlide = ({
  api,
  prevIndex,
  yamlGeneratorSlideIndex,
}: GitlabTokenSlideProps) => {
  const { theme, resolvedTheme } = useTheme();
  const imageSrc =
    theme === "dark"
      ? "/assets/gitlab-token-dark.png"
      : "/assets/gitlab-token-white.png";

  return (
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
            src={imageSrc}
            fill
          />
        </div>
      </div>

      <div className="mt-10">
        <DevguardTokenCard />
      </div>
      <div className="flex mt-10 flex-row gap-2 justify-end">
        <Button
          variant={"secondary"}
          id="gitlab-token-back"
          onClick={() => api?.scrollTo(prevIndex)}
        >
          Back
        </Button>
        <Button
          id="gitlab-token-continue"
          onClick={() => {
            api?.scrollTo(yamlGeneratorSlideIndex);
          }}
        >
          Continue
        </Button>
      </div>
    </CarouselItem>
  );
};

export default GitlabTokenSlide;
