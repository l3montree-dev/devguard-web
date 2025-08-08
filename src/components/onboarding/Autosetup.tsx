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

import { Loader2 } from "lucide-react";
import React, { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { Button } from "../ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { CarouselApi, CarouselItem } from "../ui/carousel";

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

  const asset = useActiveAsset();
  return (
    <CarouselItem>
      <div className="">
        <div className="relative isolate">
          <div className="mx-auto max-w-7xl">
            <div className="">
              <div className="w-full flex-auto">
                <CardHeader>
                  <CardTitle className="flex flex-row gap-2">
                    <SparklesIcon className="w-5 text-muted-foreground" /> Get
                    started in Seconds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    You can use the auto-setup feature to automatically add the
                    DevGuard Pipeline to the GitLab/ openCode CI/CD pipeline of
                    your project
                    {asset?.repositoryName && (
                      <span> {asset?.repositoryName}</span>
                    )}
                    . This will create a Merge-Request and add any missing
                    configuration variables and webhooks.
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex flex-col items-start justify-start gap-4">
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
                  <div className="flex flex-col gap-2">
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
                </CardFooter>
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
            </div>
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default Autosetup;
