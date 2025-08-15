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
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { CarouselApi, CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { AssetDTO } from "../../../types/api/api";

interface AutoSetupProgressSlideProps {
  asset: AssetDTO;
  handleAutosetup: (pendingAutosetup: false) => Promise<void>;
  progress: {
    [key: string]: {
      status: "notStarted" | "pending" | "success";
      message: string;
      url?: string;
    };
  };
  Loader: () => React.ReactNode;
  isReallyLoading: boolean;
  api?: {
    scrollTo: (index: number) => void;
  };
  nextIndex: number;
  prevIndex: number;
}

const AutoSetupProgressSlide: FunctionComponent<
  AutoSetupProgressSlideProps
> = ({
  asset,
  handleAutosetup,
  progress,
  Loader,
  isReallyLoading,
  api,
  nextIndex,
  prevIndex,
}) => {
  return (
    <CarouselItem>
      <div className="">
        <DialogHeader>
          <DialogTitle className="flex flex-row gap-2">
            <SparklesIcon className="w-5 text-muted-foreground" /> Get started
            in Seconds
          </DialogTitle>
          <DialogDescription>
            You can use the auto-setup feature to automatically add the DevGuard
            Pipeline to the GitLab/ openCode CI/CD pipeline of your project
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
            api?.scrollTo(prevIndex);
          }}
        >
          Back
        </Button>
      </div>
    </CarouselItem>
  );
};

export default AutoSetupProgressSlide;
