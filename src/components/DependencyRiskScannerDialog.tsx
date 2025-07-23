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
import { SparklesIcon } from "@heroicons/react/20/solid";

interface DependencyRiskScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
}

const DependencyRiskScannerDialog: FunctionComponent<
  DependencyRiskScannerDialogProps
> = ({ open, apiUrl, onOpenChange }) => {
  const [api, setApi] = React.useState<CarouselApi>();

  const [selectedScanner, setSelectedScanner] = React.useState<
    "sca" | "container-scanning" | "sbom" | "devsecops" | undefined
  >();

  const [selectedSetup, setSelectedSetup] = React.useState<
    "auto-setup" | "custom-setup" | undefined
  >();

  const asset = useActiveAsset();

  const [selectedIntegration, setSelectedIntegration] = React.useState<
    "github" | "gitlab" | "docker" | "upload" | undefined
  >(externalProviderIdToIntegrationName(asset?.externalEntityProviderId));
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();

  const pat = usePersonalAccessToken();

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

  const selectScanner = (scanner: "sca" | "container-scanning" | "sbom") => {
    setSelectedScanner(scanner);
  };

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
                <Card
                  onClick={() => setSelectedSetup("auto-setup")}
                  className={classNames(
                    "col-span-2 cursor-pointer",
                    selectedSetup === "auto-setup"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                >
                  <CardContent className="p-0">
                    <CardHeader>
                      <CardTitle className="text-lg items-center flex flex-row leading-tight">
                        <SparklesIcon className="inline-block mr-2 w-4 h-4" />
                        Auto Setup
                        <Badge className="scale-75 top-10"> Recommended</Badge>
                      </CardTitle>
                      <CardDescription>
                        We do the difficult part for you!
                      </CardDescription>
                    </CardHeader>
                  </CardContent>
                </Card>
              </div>
              <Card
                className={classNames(
                  "cursor-pointer mt-2   ",
                  selectedSetup === "custom-setup"
                    ? "border border-primary"
                    : "border border-transparent",
                )}
                onClick={() => setSelectedSetup("custom-setup")}
              >
                <CardHeader>
                  <CardTitle className="text-lg items-center flex flex-row leading-tight">
                    <FlaskConical className="inline-block mr-2" />
                    Custom Setup
                    <Badge variant={"outline"} className="scale-75">
                      Expert
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    You can have <strong>full control</strong> over Devguard!
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    api?.scrollPrev();
                    setSelectedIntegration(undefined);
                  }}
                >
                  Back
                </Button>
                <Button
                  disabled={selectedSetup === undefined}
                  onClick={() => {
                    api?.scrollNext();
                  }}
                >
                  {selectedSetup === undefined
                    ? "Select your Setup Route"
                    : "Continue"}
                </Button>
              </div>
            </CarouselItem>
            {selectedSetup === "auto-setup" &&
              (<CarouselItem>
                <DialogHeader>
                  <DialogTitle>Bring your own Scanner</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  You can either manually upload a SBOM-File or use our
                  DevGuard-Scanner to do it in a automated way.
                </DialogDescription>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Upload a SBOM-File
                    </CardTitle>
                    <CardDescription>
                      Upload a SBOM-File which is in CycloneDX 1.6 or higher
                      format. This can be done manually or through the
                      DevGuard-Scanner.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <FileUpload
                        files={fileName ? [fileName] : []}
                        dropzone={dropzone}
                      />
                    </div>
                  </CardContent>
                </Card>
                <div className="flex mt-10 flex-row gap-2 justify-end">
                  <Button
                    variant={"secondary"}
                    onClick={() => api?.scrollPrev()}
                  >
                    Back
                  </Button>
                  <AsyncButton disabled={!fileName} onClick={uploadSBOM}>
                    Upload
                  </AsyncButton>
                </div>
              </CarouselItem>)(
                <>
                  {selectedIntegration === "github" && (
                    <GithubTokenSlides
                      apiUrl={apiUrl}
                      orgSlug={activeOrg.slug}
                      projectSlug={activeProject.slug}
                      scanner={selectedScanner}
                      assetSlug={asset!.slug}
                      onPatGenerate={async () => {
                        await pat.onCreatePat({
                          scopes: "scan",
                          description: "GitHub Integration for DevGuard",
                        });
                        // put this on the next render tick
                        setTimeout(() => api?.reInit(), 0);
                      }}
                      pat={pat.pat?.privKey}
                      prev={api?.scrollPrev}
                      next={api?.scrollNext}
                    />
                  )}
                  {selectedIntegration === "gitlab" && (
                    <GitlabTokenSlides
                      apiUrl={apiUrl}
                      orgSlug={activeOrg.slug}
                      projectSlug={activeProject.slug}
                      scanner={selectedScanner}
                      assetSlug={asset!.slug}
                      onPatGenerate={async () => {
                        await pat.onCreatePat({
                          scopes: "scan",
                          description: "GitLab Integration for DevGuard",
                        });
                        // put this on the next render tick
                        setTimeout(() => api?.reInit(), 0);
                      }}
                      pat={pat.pat?.privKey}
                      prev={api?.scrollPrev}
                      next={api?.scrollNext}
                    />
                  )}
                  {selectedIntegration === "docker" && (
                    <>
                      <CarouselItem>
                        <DialogHeader>
                          <DialogTitle>Docker Integration</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                          Use our docker image to run the scanner in any
                          environment which is capable of running docker.
                        </DialogDescription>
                        <div className="mt-10">
                          <div className="mb-5">
                            <PatSection
                              {...pat}
                              description="Docker Integration"
                            />
                          </div>
                          <hr className="pb-5" />

                          <CopyCode
                            codeString={
                              // @ts-ignore
                              integrationSnippets({
                                token: pat.pat?.privKey,
                                orgSlug: activeOrg.slug,
                                projectSlug: activeProject.slug,
                                assetSlug: asset!.slug,
                                apiUrl: apiUrl,
                              })["Docker"][selectedScanner ?? "sbom"]
                            }
                          />
                        </div>
                        <div className="flex mt-10 flex-row gap-2 justify-end">
                          <Button
                            variant={"secondary"}
                            onClick={() => api?.scrollPrev()}
                          >
                            Back
                          </Button>
                          <Button
                            onClick={async () => {
                              const resp = await fetch(
                                `/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}?path=/dependency-risks`,
                                {
                                  method: "GET",
                                },
                              );
                              if (resp.redirected) {
                                router.push(
                                  `/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}?path=/dependency-risks`,
                                );
                              } else {
                                toast.error(
                                  "Scanner did not run in Repository yet",
                                );
                              }
                            }}
                          >
                            Done!
                          </Button>
                        </div>
                      </CarouselItem>
                    </>
                  )}
                </>,
              )}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyRiskScannerDialog;
