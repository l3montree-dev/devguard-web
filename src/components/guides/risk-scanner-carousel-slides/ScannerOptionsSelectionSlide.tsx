// Copyright 2025 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import React, { type FunctionComponent } from "react";
import { CarouselItem } from "../../ui/carousel";
import { Button } from "../../ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import ScannerOptionsFields from "./ScannerOptionsFields";
import type { Config } from "@/types/common";

interface ScannerOptionsSelectionSlideProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  api?: {
    scrollTo: (index: number) => void;
    reInit: () => void;
  };
  tokenSlideIndex: number;
  prevIndex: number;
  onboarding?: boolean;
}

const ScannerOptionsSelectionSlide: FunctionComponent<
  ScannerOptionsSelectionSlideProps
> = ({ config, setConfig, api, tokenSlideIndex, prevIndex, onboarding }) => {
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Select the Scans you need from the DevGuard Default Tool Set
        </DialogTitle>
        <DialogDescription>
          Choose from our curated list of scan and scanner setups to integrate.
        </DialogDescription>
      </DialogHeader>
      <div className="">
        <div className="relative mt-10 aspect-video w-full max-w-4xl b">
          <ScannerOptionsFields
            config={config}
            setConfig={setConfig}
            onLayoutChange={() => api?.reInit()}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-row gap-2 justify-end">
        {!onboarding && (
          <Button
            variant={"secondary"}
            id="scanner-options-back-to-selection"
            onClick={() => api?.scrollTo(prevIndex)}
          >
            Back
          </Button>
        )}
        <Button
          disabled={Object.values(config).every((v) => v === false)}
          id="scanner-options-selection-continue"
          onClick={() => {
            api?.scrollTo(tokenSlideIndex); // Go to token slide
          }}
        >
          {Object.values(config).every((v) => v === false)
            ? "Select Option"
            : "Continue"}
        </Button>
      </div>
    </CarouselItem>
  );
};

export default ScannerOptionsSelectionSlide;
