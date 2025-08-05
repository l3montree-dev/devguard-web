// Copyright 2025 larshermges
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

import Image from "next/image";
import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { CarouselApi, CarouselItem } from "../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import CopyCode, { CopyCodeFragment } from "../common/CopyCode";
import { integrationSnippets } from "../../integrationSnippets";
import { classNames } from "@/utils/common";
import { concat } from "lodash";
import { GitInstances } from "@/types/common";

export const AdditionalManualScannerOptions = ({
  api,
  apiUrl,
  setup,
  next,
  prev,
  pat,
  //   onPatGenerate,
  orgSlug,
  projectSlug,
  assetSlug,
}: {
  next?: () => void;
  prev?: () => void;
  setup?: "own" | "auto-setup";
  api?: CarouselApi;
  apiUrl: string;
  pat?: string;
  //   onPatGenerate: () => void;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
}) => {
  type SbomOptions = "devguard" | "trivy";

  const [sbomOptions, setSbomOptions] = useState<SbomOptions>("devguard");

  return (
    <>
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>What should your Scanner be able to do?</DialogTitle>
          <DialogDescription>Select exactly what you want</DialogDescription>
        </DialogHeader>
        <div className="">
          <div
            className="relative aspect-video w-full
            max-w-4xl b"
          >
            <div className="mt-10 flex w-full  ">
              <Card className="h-auto w-full align-middle space-y-4">
                <div className="flex flex-row  items-center space-x-4 m-2">
                  <div>
                    <div className="flex flex-col">
                      <CardTitle className=" text-base">
                        Whole Pipeline
                      </CardTitle>
                      <CardDescription className="">
                        Enable this to use full Pipeline.
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Separator className="mt-4" orientation="horizontal" />
            <h3 className="mt-4 mb-2">What should Devguard do for you?</h3>
            <Card className="">hello</Card>
            <Separator className="mt-4" orientation="horizontal" />
            <h3 className="mt-4 mb-2">What Git Instance are you using?</h3>

            <div className="flex w-full">
              <Button>
                <Image
                  src="/logo_icon.svg"
                  alt="Devguard Logo"
                  width={20}
                  height={20}
                  className="inline-block mr-2"
                />
                Devguard
              </Button>
              {/* border dark:border-foreground/20 !text-foreground
              hover:no-underline bg-transparent hover:bg-accent
              hover:text-accent-foreground */}
              <Button
                variant={"ghost"}
                className={classNames(
                  "w-full",
                  sbomOptions === "trivy"
                    ? "border border-primary"
                    : "border border-transparent",
                )}
                onClick={() => {
                  setSbomOptions("trivy");
                }}
              >
                <Image
                  src="/assets/gitlab.svg"
                  alt="Trivy Logo"
                  className="mr-2"
                  width={24}
                  height={24}
                />
                Trivy
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-row gap-2 justify-end">
          <Button variant={"secondary"} onClick={() => prev?.()}>
            Back
          </Button>
          <Button
            onClick={() => {
              next?.();
            }}
          >
            Continue
          </Button>
        </div>
      </CarouselItem>
    </>
  );
};

export default AdditionalManualScannerOptions;
