// Copyright 2024 Lars Hermges, l3montree GmbH
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

import React, { FunctionComponent } from "react";
import { CarouselApi, CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import {
  OrganizationDetailsDTO,
  GitLabIntegrationDTO,
} from "../../../types/api/api";
import GitLabIntegrationForm from "../../common/GitLabIntegrationForm";

interface GitLabIntegrationSlideProps {
  org: OrganizationDetailsDTO;
  updateOrg: (org: OrganizationDetailsDTO) => void;
  api?: {
    scrollTo: (index: number) => void;
  };
  nextIndex: number;
  prevIndex: number;
}

const GitLabIntegrationSlide: FunctionComponent<
  GitLabIntegrationSlideProps
> = ({ org, updateOrg, api, nextIndex, prevIndex }) => {
  return (
    <CarouselItem>
      <DialogHeader className="mb-4">
        <DialogTitle className="flex flex-row gap-2">
          Create a new GitLab Integration
        </DialogTitle>
        <DialogDescription>
          If you have not connected your GitLab account yet, you can do so here.
          This will allow DevGuard to access your repositories and create merge
          requests.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-10 px-1">
        <GitLabIntegrationForm
          onNewIntegration={(integration: GitLabIntegrationDTO) => {
            updateOrg({
              ...org,
              gitLabIntegrations: [...org.gitLabIntegrations, integration],
            });
          }}
          additionalOnClick={() => api?.scrollTo(nextIndex)}
          backButtonClick={() => api?.scrollTo(prevIndex)}
        />
      </div>
    </CarouselItem>
  );
};

export default GitLabIntegrationSlide;
