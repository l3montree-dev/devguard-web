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

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { toast } from "sonner";
import { CarouselApi } from "../../ui/carousel";
import { useActiveOrg } from "../../../hooks/useActiveOrg";
import useRepositoryConnection from "../../../hooks/useRepositoryConnection";
import SelectRepoSlide from "../webhook-setup-carousel-slides/SelectRepoSlide";
import { useStore } from "../../../zustand/globalStoreProvider";
import {
  RepositoryConnectionSlide,
  GitLabIntegrationSlide,
  AutoSetupProgressSlide,
} from "./slides";

interface Props {
  handleAutosetup: (pendingAutosetup: false) => Promise<void>;
  progress: {
    [key: string]: {
      status: "notStarted" | "pending" | "success";
      message: string;
      url?: string;
    };
  };
  Loader: () => React.ReactNode;
  isLoading: boolean;
  api: CarouselApi;
}

const Autosetup: FunctionComponent<Props> = ({
  handleAutosetup,
  progress,
  isLoading,
  Loader,
  api,
}) => {
  const [timedOut, setTimedOut] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        toast.error(
          "The auto-setup is taking longer than expected. Please try again later.",
        );
        setTimedOut(true);
      }
    }, 18000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const isReallyLoading = isLoading && !timedOut;

  const asset = useActiveAsset()!;
  const updateOrg = useStore((s) => s.updateOrganization);
  const org = useActiveOrg();

  const {
    repositories,
    setSelectedProvider,
    selectedProvider,
    isLoadingRepositories,
  } = useRepositoryConnection();

  return (
    <>
      <RepositoryConnectionSlide
        selectedProvider={selectedProvider}
        org={org}
        api={api}
        isLoadingRepositories={isLoadingRepositories}
      />
      <GitLabIntegrationSlide org={org} updateOrg={updateOrg} api={api} />
      <SelectRepoSlide
        api={api}
        repositoryName={asset.repositoryName}
        repositoryId={asset.repositoryId}
        repositories={repositories}
      />
      <AutoSetupProgressSlide
        asset={asset}
        handleAutosetup={handleAutosetup}
        progress={progress}
        Loader={Loader}
        isReallyLoading={isReallyLoading}
        api={api}
      />
    </>
  );
};

export default Autosetup;
