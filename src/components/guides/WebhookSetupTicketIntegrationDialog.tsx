import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import Image from "next/image";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useCallback } from "react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/router";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { externalProviderIdToIntegrationName } from "@/utils/externalProvider";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { browserApiClient } from "@/services/devGuardApi";
import { classNames } from "@/utils/common";
import CopyCode from "../common/CopyCode";
import FileUpload from "../FileUpload";
import { GithubTokenSlides } from "../risk-identification/GithubTokenInstructions";
import { GitlabTokenSlides } from "../risk-identification/GitlabTokenInstructions";
import PatSection from "../risk-identification/PatSection";
import { AsyncButton, Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import GradientText from "../misc/GradientText";
import StartSlide from "./webhook-setup-carousel-slides/StartSlide";

interface WebhookSetupTicketIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
}

const WebhookSetupTicketIntegrationDialog: FunctionComponent<
  WebhookSetupTicketIntegrationDialogProps
> = ({ open, apiUrl, onOpenChange }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const asset = useActiveAsset();
  const [selectedScanner, setSelectedScanner] = React.useState<
    "secret-scanning" | "iac" | "sast" | "sarif" | "devsecops"
  >();
  const [selectedIntegration, setSelectedIntegration] = React.useState<
    "github" | "gitlab" | "docker" | "upload" | undefined
  >(externalProviderIdToIntegrationName(asset?.externalEntityProviderId));
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();

  const pat = usePersonalAccessToken();

  const fileContent = useRef<any>(undefined);
  const [fileName, setFileName] = useState<string>();
  const router = useRouter();

  const uploadSARIF = async () => {
    const formdata = new FormData();
    formdata.append("file", fileContent.current);
    const resp = await browserApiClient(`/sarif-scan`, {
      method: "POST",
      body: fileContent.current,
      headers: {
        "X-Scanner": "SARIF-File-Upload",
        "X-Asset-Name": `${activeOrg.slug}/${activeProject.slug}/${asset?.slug}`,
      },
    });
    if (resp.ok) {
      toast.success("SARIF-Report has successfully been send!");
    } else {
      toast.error("SARIF-Report has not been send successfully");
    }
    router.push(
      `/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}/refs/main/code-risks/`,
    );

    onOpenChange(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const readerContent = reader.result as string;
        fileContent.current = readerContent;
        setFileName(file.name);
      };

      reader.readAsText(file);
    });
  }, []);

  const dropzone = useDropzone({
    onDrop,
  });

  useEffect(() => {
    api?.reInit();
  }, [selectedScanner, selectedIntegration, pat.pat, api]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <Carousel
          opts={{
            containScroll: false,
            watchDrag: false,
          }}
          className="w-full"
          plugins={[AutoHeight(), Fade()]}
          setApi={setApi}
        >
          <CarouselContent>
            <StartSlide
              setSelectedScanner={function (scanner: string): void {
                throw new Error("Function not implemented.");
              }}
              selectedScanner={undefined}
            />
            <CarouselItem>
              <DialogHeader>
                <DialogTitle>
                  {selectedScanner === "sarif"
                    ? "How would you like to upload your SARIF-Report?"
                    : "Where would you like to scan?"}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-10">
                <Card
                  className={classNames(
                    "cursor-pointer",
                    selectedIntegration === "github"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                  onClick={() => setSelectedIntegration("github")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex flex-row items-center leading-tight">
                      <Image
                        src="/assets/github.svg"
                        alt="GitLab"
                        width={20}
                        height={20}
                        className="inline-block dark:invert mr-2"
                      />
                      GitHub Actions
                    </CardTitle>
                    <CardDescription>
                      Scanning in GitHub Actions using predefined workflows. All
                      DevSecOps-Scanners as well as custom scanners are
                      supported.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card
                  className={classNames(
                    "cursor-pointer mt-2",
                    selectedIntegration === "gitlab"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                  onClick={() => setSelectedIntegration("gitlab")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg items-center flex flex-row leading-tight">
                      <Image
                        src="/assets/gitlab.svg"
                        alt="GitLab"
                        width={20}
                        height={20}
                        className="inline-block mr-2"
                      />
                      GitLab CI/CD
                    </CardTitle>
                    <CardDescription>
                      Scanning in GitLab CI/CD using predefined
                      CI/CD-Components. All DevSecOps-Scanners as well as custom
                      scanners are supported.
                    </CardDescription>
                  </CardHeader>
                </Card>
                {selectedScanner !== "devsecops" && (
                  <Card
                    className={classNames(
                      "cursor-pointer mt-2",
                      selectedIntegration === "docker"
                        ? "border border-primary"
                        : "border border-transparent",
                    )}
                    onClick={() => setSelectedIntegration("docker")}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex flex-row items-center leading-tight">
                        <Image
                          src="/assets/docker.svg"
                          alt="GitLab"
                          width={20}
                          height={20}
                          className="inline-block mr-2"
                        />
                        Docker
                      </CardTitle>
                      <CardDescription>
                        In any environment which is capable of running docker.
                        Custom-Scanners and individual scanners are supported.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
                {selectedScanner === "sarif" && (
                  <Card
                    className={classNames(
                      "cursor-pointer mt-2",
                      selectedIntegration === "upload"
                        ? "border border-primary"
                        : "border border-transparent",
                    )}
                    onClick={() => setSelectedIntegration("upload")}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex flex-row items-center leading-tight">
                        <Image
                          src="/assets/cyclonedx-logo.svg"
                          alt="Upload"
                          width={20}
                          height={20}
                          className="inline-block mr-2"
                        />
                        Upload SARIF-File
                      </CardTitle>
                      <CardDescription>
                        Upload a SBOM-File which is in CycloneDX 1.6 or higher
                        format. This can be done manually or through the
                        DevGuard-Scanner.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
              <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    api?.scrollPrev();
                    setSelectedIntegration(undefined);
                  }}
                >
                  Back to scanner selection
                </Button>
                <Button
                  disabled={selectedIntegration === undefined}
                  onClick={() => {
                    api?.scrollNext();
                  }}
                >
                  {selectedIntegration === undefined
                    ? "Select an integration"
                    : "Continue"}
                </Button>
              </div>
            </CarouselItem>
            {selectedScanner === "sarif" && selectedIntegration === "upload" ? (
              <CarouselItem>
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
                  <AsyncButton disabled={!fileName} onClick={uploadSARIF}>
                    Upload
                  </AsyncButton>
                </div>
              </CarouselItem>
            ) : (
              <>
                {selectedIntegration === "github" && (
                  <GithubTokenSlides
                    apiUrl={apiUrl}
                    orgSlug={activeOrg.slug}
                    projectSlug={activeProject.slug}
                    scanner={selectedScanner}
                    assetSlug={asset!.slug}
                    onPatGenerate={() =>
                      pat.onCreatePat({
                        scopes: "scan",
                        description: "GitHub Integration for DevGuard",
                      })
                    }
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
                    onPatGenerate={() =>
                      pat.onCreatePat({
                        scopes: "scan",
                        description: "GitLab Integration for DevGuard",
                      })
                    }
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
                            })["Docker"][selectedScanner ?? "iac"]
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
                                `/${activeOrg.slug}/projects/${activeProject?.slug}/assets/${asset?.slug}?path=/code-risks`,
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
              </>
            )}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookSetupTicketIntegrationDialog;
