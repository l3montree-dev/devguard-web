// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

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

import type { Config } from "@/types/common";
import { Button } from "../../ui/button";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import CiTokenSetup, { ciTokenInstructions } from "./CiTokenSetup";

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
  api,
  prevIndex,
  yamlGeneratorSlideIndex,
}: GithubTokenSlideProps) => {
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>{ciTokenInstructions.github.title}</DialogTitle>
        <DialogDescription>
          {ciTokenInstructions.github.description}
        </DialogDescription>
      </DialogHeader>
      <div className="mt-10">
        <CiTokenSetup provider="github" />
      </div>
      <div className="flex mt-10 flex-row gap-2 justify-end">
        <Button
          variant={"secondary"}
          id="github-token-back"
          onClick={() => api?.scrollTo(prevIndex)}
        >
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
