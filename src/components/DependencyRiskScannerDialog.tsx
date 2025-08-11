import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import Image from "next/image";
import router from "next/router";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import usePersonalAccessToken from "../hooks/usePersonalAccessToken";
import { integrationSnippets } from "../integrationSnippets";
import { multipartBrowserApiClient } from "../services/devGuardApi";
import { classNames } from "../utils/common";
import { externalProviderIdToIntegrationName } from "../utils/externalProvider";
import CopyCode, { CopyCodeFragment } from "./common/CopyCode";
import FileUpload from "./FileUpload";
import { GithubTokenSlides } from "./risk-identification/GithubTokenInstructions";
import { GitlabTokenSlides } from "./risk-identification/GitlabTokenInstructions";
import PatSection from "./risk-identification/PatSection";
import { AsyncButton, Button } from "./ui/button";
import Autosetup from "./onboarding/Autosetup";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { FlaskConical } from "lucide-react";
import { Badge } from "./ui/badge";
import { CubeTransparentIcon, SparklesIcon } from "@heroicons/react/20/solid";
import ScannerOptions from "./onboarding/ScannerOptions";
import ManualIntegration from "./onboarding/ManualIntegration";
import AdditionalManualScannerOptions from "./onboarding/AdditionalManualScannerOptions";
import { useAutosetup } from "@/hooks/useAutosetup";
import { AssetFormValues } from "./asset/AssetForm";

interface DependencyRiskScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
  repositoryProvider: AssetFormValues;
}

const DependencyRiskScannerDialog: FunctionComponent<
  DependencyRiskScannerDialogProps
> = ({ open, apiUrl, onOpenChange }) => {
  const [api, setApi] = React.useState<CarouselApi>();

  const [selectedRoute, setSelectedRouter] = React.useState<
    "sca" | "container-scanning" | "sbom" | "devsecops" | undefined
  >();
  const asset = useActiveAsset();

  const [selectedSetup, setSelectedSetup] = React.useState<
    "cherry-pick-setup" | "own-setup" | undefined
  >();

  const [selectedScanner, setSelectedScanner] = React.useState<
    "custom-setup" | "auto-setup" | undefined
  >();

  const [selectedIntegration, setSelectedIntegration] = React.useState<
    "github" | "gitlab" | "docker" | "upload" | undefined
  >(externalProviderIdToIntegrationName(asset?.externalEntityProviderId));
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();

  const pat = usePersonalAccessToken();

  const autosetup = useAutosetup("full");

  const fileContent = useRef<any>(undefined);
  const [fileName, setFileName] = useState<string>();

  const uploadSBOM = async () => {
    const formdata = new FormData();
    formdata.append("file", fileContent.current);
    const resp = await multipartBrowserApiClient(
      `/organizations/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}/sbom-file`,

      {
        method: "POST",
        body: formdata,
        headers: { "X-Scanner": "SBOM-File-Upload" },
      },
    );
    if (resp.ok) {
      toast.success("SBOM has successfully been send!");
    } else {
      toast.error("SBOM has not been send successfully");
    }

    router.push(
      `/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}?path=/dependency-risks`,
    );

    onOpenChange(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        try {
          const readerContent = reader.result as string;
          let sbomParsed;
          sbomParsed = JSON.parse(readerContent);
          if (sbomParsed.bomFormat === "CycloneDX") {
            fileContent.current = file;
            setFileName(file.name);
          } else
            toast.error(
              "SBOM does not follow CycloneDX format or Version is <1.6",
            );
        } catch (e) {
          toast.error(
            "JSON format is not recognized, make sure it is the proper format",
          );
          return;
        }
      };

      reader.readAsText(file);
    });
  }, []);

  const dropzone = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
  });

  const selectIntegration = (
    integration: "github" | "gitlab" | "docker" | "upload",
  ) => {
    setSelectedIntegration(integration);
  };

  useEffect(() => {
    api?.reInit();
  }, [selectedScanner, selectedIntegration, pat.pat, api]);

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
                            {" "}
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
                  // disabled={selectScanner === undefined}
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

export default DependencyRiskScannerDialog;
