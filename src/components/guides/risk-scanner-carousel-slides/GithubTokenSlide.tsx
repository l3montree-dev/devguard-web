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

import { Config } from "@/types/common";
import { ImageZoom } from "../../common/Zoom";
import DevguardTokenCard from "../../DevguardTokenCard";
import { Button } from "../../ui/button";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { useTheme } from "next-themes";

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
  yamlGeneratorSlideIndex: number;
  prevIndex: number;
}

const GithubTokenSlide = ({
  prevIndex,
  api,
  yamlGeneratorSlideIndex,
}: GithubTokenSlideProps) => {
  const { theme, resolvedTheme } = useTheme();
  const imageSrc =
    theme === "dark"
      ? "/assets/repo-secret-dark.png"
      : "/assets/repo-secret.png";

  return (
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
          id="github-token-back"
          onClick={() => api?.scrollTo(prevIndex)}>
          Back
        </Button>
        <Button
          id="github-token-continue"
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

export default GithubTokenSlide;
