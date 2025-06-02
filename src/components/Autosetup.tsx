// Copyright 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { Loader2 } from "lucide-react";
import { AsyncButton, Button } from "./ui/button";

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
}

const Autosetup: FunctionComponent<Props> = ({
  handleAutosetup,
  progress,
  isLoading,
  Loader,
}) => {
  const asset = useActiveAsset();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row gap-2">
          <SparklesIcon className="w-5 text-muted-foreground" /> Use Auto-Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          You can use the auto-setup feature to automatically add the DevGuard
          Pipeline to the GitLab CI/CD pipeline for the project{" "}
          <span>{asset?.repositoryName}</span>, create a Merge-Request and add
          any missing configuration variables and webhooks.
        </CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-start gap-4">
        <Button disabled={isLoading} onClick={() => handleAutosetup(false)}>
          <Loader />
          Use Auto-Setup
        </Button>
        <div className="flex flex-col gap-2">
          {Object.entries(progress).map(([key, value], i) => (
            <div
              className="flex flex-row items-center gap-2 text-sm text-muted-foreground"
              key={key}
            >
              {value.status === "notStarted" ? (
                i + 1 + "."
              ) : value.status === "pending" && !isLoading ? (
                <ExclamationCircleIcon className="mr-2 h-4 w-4 text-red-600" />
              ) : value.status === "pending" && isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin " />
              ) : (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              )}
              <span className="flex-1">
                {value.message}
                {"url" in value && (
                  <>
                    <br />
                    <a href={value.url} target="_blank">
                      {value.url}
                    </a>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default Autosetup;
