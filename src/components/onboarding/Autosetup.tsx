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

import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import React, { FunctionComponent } from "react";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { CarouselApi, CarouselItem } from "../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import GitLabIntegrationForm from "../common/GitLabIntegrationForm";
import { GitLabIntegrationDTO } from "../../types/api/api";
import StartSlide from "../guides/webhook-setup-carousel-slides/StartSlide";
import useRepositoryConnection from "../../hooks/useRepositoryConnection";
import SelectRepoSlide from "../guides/webhook-setup-carousel-slides/SelectRepoSlide";
import ProviderIntegrationSetupSlide from "../guides/webhook-setup-carousel-slides/ProviderIntegrationSetupSlide";
import ProviderSetup from "../guides/webhook-setup-carousel-slides/ProviderSetup";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useStore } from "../../zustand/globalStoreProvider";

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
      <CarouselItem>
        <DialogHeader>
          <DialogTitle className="flex flex-row gap-2">
            DevGuard needs an access token to connect to your repository
          </DialogTitle>
          <DialogDescription>
            Enter the information below to connect your repository with
            DevGuard.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 px-1">
          {org.gitLabIntegrations.length > 0 && (
            <ProviderSetup
              selectedProvider={selectedProvider}
              activeOrg={org}
              api={api}
              isLoadingRepositories={isLoadingRepositories}
            />
          )}
        </div>
      </CarouselItem>
      <CarouselItem>
        <DialogHeader className="mb-4">
          <DialogTitle className="flex flex-row gap-2">
            Create a new GitLab Integration
          </DialogTitle>
          <DialogDescription>
            If you have not connected your GitLab account yet, you can do so
            here. This will allow DevGuard to access your repositories and
            create merge requests.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 px-1">
          <GitLabIntegrationForm
            onNewIntegration={(integration) => {
              updateOrg({
                ...org,
                gitLabIntegrations: [...org.gitLabIntegrations, integration],
              });
            }}
            additionalOnClick={api?.scrollNext}
            backButtonClick={api?.scrollPrev}
          />
        </div>
      </CarouselItem>
      <SelectRepoSlide
        api={api}
        repositoryName={asset.repositoryName}
        repositoryId={asset.repositoryId}
        repositories={repositories}
      />
      <CarouselItem>
        <div className="">
          <DialogHeader>
            <DialogTitle className="flex flex-row gap-2">
              <SparklesIcon className="w-5 text-muted-foreground" /> Get started
              in Seconds
            </DialogTitle>
            <DialogDescription>
              You can use the auto-setup feature to automatically add the
              DevGuard Pipeline to the GitLab/ openCode CI/CD pipeline of your
              project
              {asset?.repositoryName && <span> {asset?.repositoryName}</span>}.
              This will create a Merge-Request and add any missing configuration
              variables and webhooks.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {progress.mergeRequest.status === "success" &&
            progress.mergeRequest.url !== undefined ? (
              <Link
                href={
                  Object.values(progress).find(
                    (v) => v.url && v.status === "success",
                  )?.url || "#"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button disabled={isReallyLoading}>
                  <Loader />
                  View Merge Request
                </Button>
              </Link>
            ) : (
              <Button
                disabled={isReallyLoading}
                onClick={() => handleAutosetup(false)}
              >
                <Loader />
                Use Auto-Setup
              </Button>
            )}
            <div className="flex flex-col mt-10 gap-2">
              {Object.entries(progress).map(([key, value], i) => (
                <div
                  className="flex flex-row items-center gap-2 text-sm text-muted-foreground"
                  key={key}
                >
                  {value.status === "notStarted" ? (
                    i + 1 + "."
                  ) : value.status === "pending" && !isReallyLoading ? (
                    <ExclamationCircleIcon className="mr-2 h-4 w-4 text-red-600" />
                  ) : value.status === "pending" && isReallyLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  )}
                  <span className="flex-1">
                    {value.message}
                    {"url" in value && (
                      <>
                        <br />
                        <a
                          href={value.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {value.url}
                        </a>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-end">
          <Button
            variant={"secondary"}
            onClick={() => {
              api?.scrollPrev();
            }}
          >
            Back
          </Button>
        </div>
      </CarouselItem>
    </>
  );
};

export default Autosetup;
