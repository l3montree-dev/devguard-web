import { SparklesIcon } from "@heroicons/react/20/solid";
import { FlaskConical } from "lucide-react";
import { FunctionComponent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { AssetDTO } from "@/types/api/api";
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
    | "custom-setup"
    | "auto-setup"
    | "information-source"
    | undefined;
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
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>How do you want to Setup Devguard?</DialogTitle>
      </DialogHeader>
      <div className="mt-10">
        {(asset?.repositoryProvider === "gitlab" ||
          asset?.externalEntityId) && (
          <Card
            onClick={() => setSelectedScanner("auto-setup")}
            className={classNames(
              "col-span-2 cursor-pointer",
              selectedScanner === "auto-setup"
                ? "border border-primary"
                : "border border-transparent",
            )}
          >
            <CardContent className="p-0">
              <CardHeader>
                <CardTitle className="text-lg items-center flex flex-row leading-tight">
                  <SparklesIcon className="inline-block mr-2 w-4 h-4" />
                  Auto Setup
                  <Badge className="top-10 ml-4 bg-primary/20 ring-1 ring-primary text-primary-content">
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
            : "border border-transparent",
        )}
        onClick={() => setSelectedScanner("custom-setup")}
      >
        <CardHeader>
          <CardTitle className="text-lg items-center flex flex-row leading-tight">
            <FlaskConical className="inline-block mr-2 w-4 h-4" />
            Custom Setup
            <Badge className="ml-4 ring-1 ring-purple-500 text-secondary-content bg-purple-500/20">
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
            : "border border-transparent",
        )}
        onClick={() => setSelectedScanner("information-source")}
      >
        <CardHeader>
          <CardTitle className="text-lg items-center flex flex-row leading-tight">
            <LinkIcon className="inline-block mr-2 w-4 h-4" />
            Supplier provided SBOM (URL)
            <Badge className="ml-4 ring-1 ring-purple-500 text-secondary-content bg-purple-500/20">
              Expert
            </Badge>
          </CardTitle>
          <CardDescription>
            Provide an SBOM URLs to setup Devguard based on external data
            sources. This data will be periodically fetched and updated.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
        <Button
          disabled={selectedScanner === undefined}
          id="setup-method-continue"
          onClick={() => {
            const targetSlide =
              selectedScanner === "auto-setup"
                ? autosetupSlideIndex
                : selectedScanner === "information-source"
                  ? setupInformationSourceSlideIndex
                  : selectScannerSlideIndex;
            api?.scrollTo(targetSlide);
          }}
        >
          {selectedScanner === undefined ? "Select an Setup Route" : "Continue"}
        </Button>
      </div>
    </CarouselItem>
  );
};
