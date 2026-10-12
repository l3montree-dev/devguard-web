// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { SparklesIcon } from "@heroicons/react/20/solid";
import { FlaskConical } from "lucide-react";
import type { FunctionComponent } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { classNames } from "@/utils/common";
import type { AssetDTO } from "@/types/dto";
import { LinkIcon } from "@heroicons/react/24/outline";

interface SetupMethodSelectionSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  autosetupSlideIndex: number;
  selectScannerSlideIndex: number;
  setupInformationSourceSlideIndex: number;
  asset: AssetDTO | null;
  selectedScanner:
    "custom-setup" | "auto-setup" | "information-source" | undefined;
  setSelectedScanner: (
    scanner: "custom-setup" | "auto-setup" | "information-source",
  ) => void;
}

export const SetupMethodSelectionSlide: FunctionComponent<
  SetupMethodSelectionSlideProps
> = ({
  api,
  asset,
  selectedScanner,
  setSelectedScanner,
  setupInformationSourceSlideIndex,
  autosetupSlideIndex,
  selectScannerSlideIndex,
}) => {
  // selecting a setup route directly continues with its first slide
  const handleSelect = (
    scanner: "custom-setup" | "auto-setup" | "information-source",
  ) => {
    setSelectedScanner(scanner);
    api?.scrollTo(
      scanner === "auto-setup"
        ? autosetupSlideIndex
        : scanner === "information-source"
          ? setupInformationSourceSlideIndex
          : selectScannerSlideIndex,
    );
  };

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>How do you want to Setup Devguard?</DialogTitle>
      </DialogHeader>
      <div className="mt-10">
        {(asset?.repositoryProvider === "gitlab" ||
          asset?.externalEntityId) && (
          <Card
            onClick={() => handleSelect("auto-setup")}
            className={classNames(
              "col-span-2 cursor-pointer",
              selectedScanner === "auto-setup"
                ? "border border-primary"
                : "border border-transparent hover:border-primary",
            )}
          >
            <CardContent data-testid="auto-setup-gitlab" className="p-0">
              <CardHeader>
                <CardTitle className="text-lg items-center flex flex-row leading-tight">
                  <SparklesIcon className="inline-block mr-2 w-4 h-4" />
                  Auto Setup
                  <Badge variant="default" className="ml-auto">
                    Recommended
                  </Badge>
                </CardTitle>
                <CardDescription>
                  We do the difficult part for you. But we need your
                  permissions!
                </CardDescription>
              </CardHeader>
            </CardContent>
          </Card>
        )}
      </div>
      <Card
        className={classNames(
          "cursor-pointer mt-2   ",
          selectedScanner === "custom-setup"
            ? "border border-primary"
            : "border border-transparent hover:border-primary",
        )}
        onClick={() => handleSelect("custom-setup")}
      >
        <CardHeader>
          <CardTitle className="text-lg items-center flex flex-row leading-tight">
            <FlaskConical className="inline-block mr-2 w-4 h-4" />
            Custom Setup
            <Badge variant="blue" className="ml-auto">
              Expert
            </Badge>
          </CardTitle>
          <CardDescription>
            Explicitly select which scans to integrate, use your own scanner or
            upload a SBOM file.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card
        className={classNames(
          "cursor-pointer mt-2   ",
          selectedScanner === "information-source"
            ? "border border-primary"
            : "border border-transparent hover:border-primary",
        )}
        onClick={() => handleSelect("information-source")}
      >
        <CardHeader>
          <CardTitle className="text-lg items-center flex flex-row leading-tight">
            <LinkIcon className="inline-block mr-2 w-4 h-4" />
            External SBOM URLs (URL)
            <Badge variant="blue" className="ml-auto">
              Expert
            </Badge>
          </CardTitle>
          <CardDescription>
            Provide SBOM URLs to setup Devguard based on external data sources.
            This data will be periodically fetched and updated.
          </CardDescription>
        </CardHeader>
      </Card>
    </CarouselItem>
  );
};
