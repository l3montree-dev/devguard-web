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
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { OrganizationDetailsDTO } from "../../../types/api/api";
import { ExternalTicketProvider } from "../../../types/common";
import ProviderSetup from "../ProviderSetup";

interface RepositoryConnectionSlideProps {
  selectedProvider: ExternalTicketProvider;
  org: OrganizationDetailsDTO;
  api?: {
    scrollTo: (index: number) => void;
  };
  isLoadingRepositories: boolean;
  selectRepoSlideIndex: number;
  providerIntegrationSlideIndex: number;
  prevIndex: number;
}

const ProviderSetupSlide: FunctionComponent<RepositoryConnectionSlideProps> = ({
  selectedProvider,
  org,
  api,
  prevIndex,
  selectRepoSlideIndex,
  providerIntegrationSlideIndex,
  isLoadingRepositories,
}) => {
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle className="flex flex-row gap-2">
          DevGuard needs an access token to connect to your repository
        </DialogTitle>
        <DialogDescription>
          Enter the information below to connect your repository with DevGuard.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-10 px-1">
        <ProviderSetup
          selectedProvider={selectedProvider}
          activeOrg={org}
          api={api}
          prevIndex={prevIndex}
          selectRepoSlideIndex={selectRepoSlideIndex}
          providerIntegrationSlideIndex={providerIntegrationSlideIndex}
          isLoadingRepositories={isLoadingRepositories}
        />
      </div>
    </CarouselItem>
  );
};

export default ProviderSetupSlide;
