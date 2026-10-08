// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { CubeTransparentIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LinkIcon } from "@heroicons/react/24/outline";

interface ScannerSelectionSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  devguardToolsSlideIndex: number;
  devguardCliSlideIndex: number;
  customSetupSlideIndex: number;
  informationSourceSlideIndex: number;
  // undefined if the dialog opened on this slide - there is nothing to go back to
  prevIndex?: number;
}

export default function ScannerSelectionSlide({
  api,
  devguardCliSlideIndex,
  informationSourceSlideIndex,
  devguardToolsSlideIndex,
  customSetupSlideIndex,
  prevIndex,
}: ScannerSelectionSlideProps) {
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>What Scanner do you want to use?</DialogTitle>
      </DialogHeader>
      <div className="mt-10">
        <Card
          className="cursor-pointer hover:border-primary"
          onClick={() => {
            api?.scrollTo(devguardToolsSlideIndex);
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg flex flex-row items-center leading-tight">
              <Image
                src="/logo_icon.svg"
                alt="Devguard Logo"
                width={20}
                height={20}
                className="inline-block mr-2 w-4 h-4"
              />
              Devguard CI/CD Integration
              <Badge variant="default" className="ml-auto">
                Recommended
              </Badge>
            </CardTitle>
            <CardDescription>
              From our curated list of scans and scanners, select the ones you
              want to use.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer mt-2 hover:border-primary"
          onClick={() => {
            api?.scrollTo(devguardCliSlideIndex);
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg flex flex-row items-center leading-tight">
              <Image
                src="/logo_icon.svg"
                alt="Devguard Logo"
                width={20}
                height={20}
                className="inline-block mr-2 w-4 h-4"
              />
              Devguard CLI
              <Badge variant="default" className="ml-auto">
                Recommended
              </Badge>
            </CardTitle>
            <CardDescription>
              Use the devguard cli to run scans and upload the results to
              Devguard.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer mt-2 hover:border-primary"
          onClick={() => {
            api?.scrollTo(customSetupSlideIndex);
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg items-center flex flex-row leading-tight">
              <CubeTransparentIcon
                width={20}
                height={20}
                className="inline-block mr-2 w-4 h-4"
              />
              Use your own Scanner or manually upload
              <Badge variant="blue" className="ml-auto">
                Expert
              </Badge>
            </CardTitle>
            <CardDescription>
              You already have a Scanner or a SARIF/SBOM file and want to just
              upload your results...
            </CardDescription>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer mt-2 hover:border-primary"
          onClick={() => {
            api?.scrollTo(informationSourceSlideIndex);
          }}
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
              Provide SBOM URLs to setup Devguard based on external data
              sources. This data will be periodically fetched and updated.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      {prevIndex !== undefined && (
        <div className="mt-10 flex flex-row gap-2 justify-end">
          <Button
            variant={"secondary"}
            id="scanner-selection-back"
            onClick={() => api?.scrollTo(prevIndex)}
          >
            Back
          </Button>
        </div>
      )}
    </CarouselItem>
  );
}
