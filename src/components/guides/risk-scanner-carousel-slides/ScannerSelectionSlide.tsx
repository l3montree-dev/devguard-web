// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { CubeTransparentIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
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
}

export default function ScannerSelectionSlide({
  api,
  devguardCliSlideIndex,
  informationSourceSlideIndex,
  devguardToolsSlideIndex,
  customSetupSlideIndex,
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
              <Badge className="top-10 ml-4 bg-primary/20 ring-1 ring-primary text-primary-content">
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
              <Badge className="top-10 ml-4 bg-primary/20 ring-1 ring-primary text-primary-content">
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
              <Badge className="ml-4 ring-1 ring-accent text-secondary-content bg-accent-muted">
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
              Supplier provided SBOM (URL)
              <Badge className="ml-4 ring-1 ring-accent text-secondary-content bg-accent-muted">
                Expert
              </Badge>
            </CardTitle>
            <CardDescription>
              Provide an SBOM URLs to setup Devguard based on external data
              sources. This data will be periodically fetched and updated.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </CarouselItem>
  );
}
