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

interface SetupMethodSelectionSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  autosetupSlideIndex: number;
  selectScannerSlideIndex: number;
  asset: AssetDTO | null;
  selectedScanner: "custom-setup" | "auto-setup" | undefined;
  setSelectedScanner: (scanner: "custom-setup" | "auto-setup") => void;
}

export const SetupMethodSelectionSlide: FunctionComponent<
  SetupMethodSelectionSlideProps
> = ({
  api,
  asset,
  selectedScanner,
  setSelectedScanner,
  autosetupSlideIndex,
  selectScannerSlideIndex,
}) => {
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>How do you want to Setup Devguard?</DialogTitle>
      </DialogHeader>
      <div className="mt-10">
        {asset?.repositoryProvider === "gitlab" && (
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
                  We do the difficult part for you!
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
            Explicitly select which scans to integrate, or use your own scanner.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
        <Button
          disabled={selectedScanner === undefined}
          onClick={() => {
            const targetSlide =
              selectedScanner === "auto-setup"
                ? autosetupSlideIndex
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
