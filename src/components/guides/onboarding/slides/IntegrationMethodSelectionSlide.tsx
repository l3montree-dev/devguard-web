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
import { classNames } from "../../../../utils/common";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { CarouselItem } from "../../../ui/carousel";
import { DialogHeader, DialogTitle } from "../../../ui/dialog";

interface IntegrationMethodSelectionSlideProps {
  variant: "manual" | "auto";
  setVariant: (variant: "manual" | "auto") => void;
  next?: () => void;
  prev?: () => void;
}

const IntegrationMethodSelectionSlide: FunctionComponent<
  IntegrationMethodSelectionSlideProps
> = ({ variant, setVariant, next, prev }) => {
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>Would you like to do it manual or automatic?</DialogTitle>
      </DialogHeader>
      <div className="mt-10 px-1">
        <Card
          className={classNames(
            "cursor-pointer mt-6",
            variant === "auto"
              ? "border border-primary"
              : "border border-transparent",
          )}
          onClick={() => setVariant("auto")}
        >
          <CardHeader>
            <CardTitle className="text-lg items-center flex flex-row leading-tight">
              <CommandLineIcon
                width={20}
                height={20}
                className="inline-block mr-2 w-4 h-4"
              />
              <span>Automatically upload using a Command Line Tool</span>
              <Badge className="top-10 ml-4 bg-primary/20 ring-1 ring-primary text-primary-content">
                Recommended
              </Badge>
            </CardTitle>
            <CardDescription>
              You want to automate the process of uploading SBOMs or
              SARIF-Reports? Maybe inside a CI/CD pipeline?
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
              <DocumentArrowUpIcon
                width={20}
                height={20}
                className="inline-block mr-2 w-4 h-4"
              />
              Manually upload a SBOM or SARIF file using a Drag&apos;n Drop
              interface
            </CardTitle>
            <CardDescription>
              You got a SBOM or SARIF file and want to upload it to DevGuard?
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="flex mt-8 flex-row gap-2 justify-end">
          <Button variant="secondary" onClick={() => prev?.()}>
            Back
          </Button>
          <Button onClick={() => next?.()}>Continue</Button>
        </div>
      </div>
    </CarouselItem>
  );
};

export default IntegrationMethodSelectionSlide;
