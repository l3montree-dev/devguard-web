// Copyright (C) 2025 Lars Hermges, l3montree GmbH.
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

import {
  CommandLineIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import { FunctionComponent } from "react";
import { classNames } from "../../../utils/common";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { CarouselItem } from "../../ui/carousel";
import { DialogHeader, DialogTitle } from "../../ui/dialog";

interface IntegrationMethodSelectionSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  variant: "manual" | "auto";
  prevIndex: number;
  setVariant: (variant: "manual" | "auto") => void;
  cliSlideIndex: number;
  fileUploadSlideIndex: number;
}

const IntegrationMethodSelectionSlide: FunctionComponent<
  IntegrationMethodSelectionSlideProps
> = ({
  api,
  variant,
  setVariant,
  prevIndex,
  cliSlideIndex,
  fileUploadSlideIndex,
}) => {
  return (
    <CarouselItem>
      <div className="">
        <DialogHeader>
          <DialogTitle>How do you want to upload results?</DialogTitle>
        </DialogHeader>
        <div className="mt-10">
          <Card
            className={classNames(
              "cursor-pointer",
              variant === "auto"
                ? "border border-primary"
                : "border border-transparent",
            )}
            onClick={() => setVariant("auto")}
          >
            <CardHeader>
              <CardTitle className="text-lg items-center flex flex-row leading-tight">
                <CommandLineIcon className="inline-block mr-2 w-4 h-4" />
                Use our CLI
                <Badge className="top-10 ml-4 bg-primary/20 ring-1 ring-primary text-primary-content">
                  Recommended
                </Badge>
              </CardTitle>
              <CardDescription>
                Use the devguard-scanner CLI tool to upload SBOM files or SARIF
                reports from your own scanner.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card
            className={classNames(
              "cursor-pointer mt-2",
              variant === "manual"
                ? "border border-primary"
                : "border border-transparent",
            )}
            onClick={() => setVariant("manual")}
          >
            <CardHeader>
              <CardTitle className="text-lg items-center flex flex-row leading-tight">
                <DocumentArrowUpIcon className="inline-block mr-2 w-4 h-4" />
                Upload manually
                <Badge className="ml-4 ring-1 ring-purple-500 text-secondary-content bg-purple-500/20">
                  File Upload
                </Badge>
              </CardTitle>
              <CardDescription>
                You got a SBOM or SARIF file and want to upload it via web
                interface
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <div className="mt-10 flex flex-row gap-2 justify-end">
          <Button variant="secondary" onClick={() => api?.scrollTo(prevIndex)}>
            Back
          </Button>
          <Button
            onClick={() =>
              api?.scrollTo(
                variant === "auto" ? cliSlideIndex : fileUploadSlideIndex,
              )
            }
          >
            Continue
          </Button>
        </div>
      </div>
    </CarouselItem>
  );
};

export default IntegrationMethodSelectionSlide;
