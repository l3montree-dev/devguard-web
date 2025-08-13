import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import Image from "next/image";
import React, { FunctionComponent, useEffect } from "react";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import usePersonalAccessToken from "../hooks/usePersonalAccessToken";
import { classNames } from "../utils/common";
import Autosetup from "./guides/onboarding/Autosetup";
import { Button } from "./ui/button";

import { useAutosetup } from "@/hooks/useAutosetup";
import { CubeTransparentIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { FlaskConical } from "lucide-react";
import ManualIntegration from "./guides/onboarding/ManualIntegration";
import ScannerOptions from "./guides/onboarding/ScannerOptions";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface RiskScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
}

const RiskScannerDialog: FunctionComponent<RiskScannerDialogProps> = ({
  open,
  apiUrl,
  onOpenChange,
}) => {
  const [api, setApi] = React.useState<CarouselApi>();

  const asset = useActiveAsset();

  const [selectedSetup, setSelectedSetup] = React.useState<
    "cherry-pick-setup" | "own-setup" | undefined
  >();

  const [selectedScanner, setSelectedScanner] = React.useState<
    "custom-setup" | "auto-setup" | undefined
  >();

  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();

  const pat = usePersonalAccessToken();

  const autosetup = useAutosetup("full");

  useEffect(() => {
    api?.reInit();
  }, [selectedScanner, pat.pat, api]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <Carousel
          opts={{
            watchDrag: false,
            containScroll: false,
          }}
          className="w-full"
          plugins={[AutoHeight(), Fade()]}
          setApi={setApi}
        >
          <CarouselContent>
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
                    Explicitly select which scans to integrate, or use your own
                    scanner.
                  </CardDescription>
                </CardHeader>
              </Card>
              <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
                <Button
                  disabled={selectedScanner === undefined}
                  onClick={() => {
                    api?.scrollNext();
                  }}
                >
                  {selectedScanner === undefined
                    ? "Select an Setup Route"
                    : "Continue"}
                </Button>
              </div>
            </CarouselItem>

            {selectedScanner === "auto-setup" && (
              <Autosetup api={api} {...autosetup} />
            )}

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
                      From our curated list of scans and scanners, select the
                      ones you want to use.
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
                      You already have a Scanner and want to just Upload your
                      results...
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    api?.scrollPrev();
                    setSelectedScanner(undefined);
                  }}
                >
                  Back
                </Button>
                <Button
                  disabled={selectedScanner === undefined}
                  onClick={() => {
                    api?.scrollNext();
                  }}
                >
                  {selectedSetup === undefined ||
                  selectedScanner === "auto-setup"
                    ? "Select a Scanner"
                    : "Continue"}
                </Button>
              </div>
            </CarouselItem>

            {selectedSetup === "cherry-pick-setup" && (
              <ScannerOptions
                api={api}
                apiUrl={apiUrl}
                next={api?.scrollNext}
                prev={api?.scrollPrev}
                orgSlug={activeOrg.slug}
                projectSlug={activeProject.slug}
                assetSlug={asset!.slug}
              ></ScannerOptions>
            )}
            {selectedSetup === "own-setup" && (
              <ManualIntegration
                api={api}
                apiUrl={apiUrl}
                next={api?.scrollNext}
                prev={api?.scrollPrev}
                orgSlug={activeOrg.slug}
                projectSlug={activeProject.slug}
                assetSlug={asset!.slug}
              ></ManualIntegration>
            )}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default RiskScannerDialog;
