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
import { classNames } from "@/utils/common";

interface ScannerSelectionSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  selectedSetup?: "cherry-pick-setup" | "own-setup";
  setSelectedSetup: (setup: "cherry-pick-setup" | "own-setup") => void;
  setSelectedScanner: (
    scanner: "custom-setup" | "auto-setup" | undefined,
  ) => void;
  selectedScanner?: "custom-setup" | "auto-setup";
}

export default function ScannerSelectionSlide({
  api,
  selectedSetup,
  setSelectedSetup,
  setSelectedScanner,
  selectedScanner,
}: ScannerSelectionSlideProps) {
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>What Scanner do you want to use?</DialogTitle>
      </DialogHeader>
      <div className="mt-10">
        <Card
          className={classNames(
            "cursor-pointer",
            selectedSetup === "cherry-pick-setup"
              ? "border border-primary"
              : "border border-transparent",
          )}
          onClick={() => setSelectedSetup("cherry-pick-setup")}
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
              Devguard Default Tools
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
          className={classNames(
            "cursor-pointer mt-2",
            selectedSetup === "own-setup"
              ? "border border-primary"
              : "border border-transparent",
          )}
          onClick={() => setSelectedSetup("own-setup")}
        >
          <CardHeader>
            <CardTitle className="text-lg items-center flex flex-row leading-tight">
              <CubeTransparentIcon
                width={20}
                height={20}
                className="inline-block mr-2 w-4 h-4"
              />
              Use your own Scanner
              <Badge className="ml-4 ring-1 ring-purple-500 text-secondary-content bg-purple-500/20">
                Expert
              </Badge>
            </CardTitle>
            <CardDescription>
              You already have a Scanner and want to just Upload your results...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
        <Button
          variant={"secondary"}
          onClick={() => {
            api?.scrollTo(0); // Back to SetupMethodSelectionSlide
            setSelectedScanner(undefined);
          }}
        >
          Back
        </Button>
        <Button
          disabled={selectedSetup === undefined}
          onClick={() => {
            api?.scrollTo(3); // Forward to slide 3
          }}
        >
          {selectedSetup === undefined ? "Select a Scanner" : "Continue"}
        </Button>
      </div>
    </CarouselItem>
  );
}
