import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
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
    "sca" | "container-scanning" | "sbom"
  >();
  const asset = useActiveAsset();

  const [selectedIntegration, setSelectedIntegration] = React.useState<
    "github" | "gitlab" | "docker" | "upload" | undefined
  >(externalProviderIdToIntegrationName(asset?.externalEntityProviderId));
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const assetVersion = useActiveAssetVersion();

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
                <DialogTitle>
                  What dependency risks would you like to identify?
                </DialogTitle>
              </DialogHeader>
              <div className="mt-10">
                <Card
                  className={classNames(
                    "cursor-pointer",
                    selectedScanner === "sca"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                  onClick={() => selectScanner("sca")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex flex-row items-center leading-tight">
                      <Image
                        src="/assets/git.svg"
                        alt="GitLab"
                        width={20}
                        height={20}
                        className="inline-block mr-2"
                      />
                      Software-Composition-Analysis of a Repository
                    </CardTitle>
                    <CardDescription>
                      Inspect your dependency tree for known vulnerabilities.
                      You should always do this, even when distributing your
                      software as a OCI-Image.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card
                  className={classNames(
                    "cursor-pointer mt-2",
                    selectedScanner === "container-scanning"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                  onClick={() => selectScanner("container-scanning")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg items-center flex flex-row leading-tight">
                      <div className="w-5 h-5 mr-2">
                        <Image
                          src={"/assets/oci-icon-white.svg"}
                          alt="GitLab"
                          width={20}
                          height={20}
                          className="hidden dark:inline-block absolute"
                        />
                        <Image
                          src={"/assets/oci-icon-pantone.svg"}
                          alt="GitLab"
                          width={20}
                          height={20}
                          className="inline-block dark:hidden absolute"
                        />
                      </div>
                      Software-Composition-Analysis of an OCI-Image
                    </CardTitle>
                    <CardDescription>
                      Scanning in GitLab CI/CD using predefined
                      CI/CD-Components. All DevSecOps-Scanners as well as custom
                      scanners are supported.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card
                  className={classNames(
                    "cursor-pointer mt-2",
                    selectedScanner === "sbom"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                  onClick={() => selectScanner("sbom")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex flex-row items-center leading-tight">
                      I bring my own Scanner
                    </CardTitle>
                    <CardDescription>
                      You can integrate any scanner which is able to produce a
                      SBOM-File (currently only CycloneDX 1.6 or higher is
                      supported). You This can be done in any environment which
                      is capable of running docker.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
                <Button
                  disabled={selectedScanner === undefined}
                  onClick={() => {
                    api?.scrollNext();
                  }}
                >
                  {selectedScanner === undefined
                    ? "Select a scanner"
                    : "Continue"}
                </Button>
              </div>
            </CarouselItem>

            <CarouselItem>
              <DialogHeader>
                <DialogTitle>
                  {selectedScanner === "sbom"
                    ? "How would you like to upload your SBOM?"
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
                  onClick={() => selectIntegration("github")}
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
                  onClick={() => selectIntegration("gitlab")}
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
                <Card
                  className={classNames(
                    "cursor-pointer mt-2",
                    selectedIntegration === "docker"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                  onClick={() => selectIntegration("docker")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex flex-row items-center leading-tight">
                      <Image
                        src="/assets/docker.svg"
                        alt="Docker"
                        width={20}
                        height={20}
                        className="inline-block mr-2"
                      />
                      Docker Integration
                    </CardTitle>
                    <CardDescription>
                      Use our docker image to run the scanner in any environment
                      which is capable of running docker.
                    </CardDescription>
                  </CardHeader>
                </Card>
                {selectedScanner === "sbom" && (
                  <Card
                    className={classNames(
                      "cursor-pointer mt-2",
                      selectedIntegration === "upload"
                        ? "border border-primary"
                        : "border border-transparent",
                    )}
                    onClick={() => selectIntegration("upload")}
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
                        Upload SBOM-File
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
                  Back
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
            {selectedScanner === "sbom" && selectedIntegration === "upload" ? (
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
                  <AsyncButton disabled={!fileName} onClick={uploadSBOM}>
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
              </>
            )}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyRiskScannerDialog;
