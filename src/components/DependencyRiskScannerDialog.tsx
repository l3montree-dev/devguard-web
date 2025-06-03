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
import {
  browserApiClient,
  multipartBrowserApiClient,
} from "../services/devGuardApi";
import { classNames } from "../utils/common";
import CopyCode, { CopyCodeFragment } from "./common/CopyCode";
import FileUpload from "./FileUpload";
import { GithubTokenSlides } from "./risk-identification/GithubTokenInstructions";
import { GitlabTokenSlides } from "./risk-identification/GitlabTokenInstructions";
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
import PatSection from "./risk-identification/PatSection";
import { externalProviderIdToIntegrationName } from "../utils/externalProvider";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";

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
    "sca" | "container-scanning" | "devsecops"
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
                <DialogTitle>Where would you like to scan?</DialogTitle>
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
                        alt="GitLab"
                        width={20}
                        height={20}
                        className="inline-block mr-2"
                      />
                      Upload SBOM
                    </CardTitle>
                    <CardDescription>
                      You can integrate any scanner, which is able to produce a
                      SBOM-File.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
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
            {selectedIntegration === "upload" ? (
              <CarouselItem>
                <DialogHeader>
                  <DialogTitle>Upload SBOM-File</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Just drag and drop your SBOM-File here or click to select it.
                </DialogDescription>
                <div className="mt-10">
                  <FileUpload
                    files={fileName ? [fileName] : []}
                    dropzone={dropzone}
                  />
                </div>
                <div className="flex mt-10 flex-row gap-2 justify-end">
                  <Button
                    variant={"secondary"}
                    onClick={() => api?.scrollPrev()}
                  >
                    Back
                  </Button>
                  <AsyncButton onClick={uploadSBOM} disabled={!fileName}>
                    Upload
                  </AsyncButton>
                </div>
              </CarouselItem>
            ) : (
              <>
                <CarouselItem>
                  <DialogHeader>
                    <DialogTitle>
                      What scanner would you like to integrate?
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-2 mt-10">
                    {selectedIntegration !== "docker" && (
                      <Card
                        onClick={() => setSelectedScanner("devsecops")}
                        className={classNames(
                          "col-span-2 cursor-pointer",
                          selectedScanner === "devsecops"
                            ? "border border-primary"
                            : "border border-transparent",
                        )}
                      >
                        <CardContent className="p-0">
                          <CardHeader>
                            <CardTitle className="text-lg leading-tight">
                              Whole DevSecOps-Pipeline
                            </CardTitle>
                            <CardDescription>
                              Integrate a whole DevSecOps-Pipeline including
                              dependency risk identification. This is only
                              possible through CI/CD Components and
                              GitHub-Actions.
                            </CardDescription>
                          </CardHeader>
                        </CardContent>
                      </Card>
                    )}
                    <Card
                      onClick={() => setSelectedScanner("sca")}
                      className={classNames(
                        "cursor-pointer ",
                        selectedScanner === "sca"
                          ? "border border-primary"
                          : "border border-transparent",
                      )}
                    >
                      <CardContent className="p-0">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Software-Composition-Analysis from Repository
                          </CardTitle>
                          <CardDescription>
                            Inspect your dependency tree for known
                            vulnerabilities. You should always do this, even
                            when distributing your software as a OCI- or
                            Docker-Image.
                          </CardDescription>
                        </CardHeader>
                      </CardContent>
                    </Card>
                    <Card
                      onClick={() => setSelectedScanner("container-scanning")}
                      className={classNames(
                        "cursor-pointer",
                        selectedScanner === "container-scanning"
                          ? "border border-primary"
                          : "border border-transparent",
                      )}
                    >
                      <CardContent className="p-0">
                        <CardHeader>
                          <CardTitle className="text-lg leading-tight">
                            Container-Scanning
                          </CardTitle>
                          <CardDescription>
                            Scans a container image for known vulnerabilties.
                            Can only be used with local{" "}
                            <CopyCodeFragment codeString=".tar" /> archives.
                          </CardDescription>
                        </CardHeader>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-10 flex flex-row gap-2 justify-end">
                    <Button
                      variant={"secondary"}
                      onClick={() => {
                        api?.scrollPrev();
                        setSelectedScanner(undefined);
                      }}
                    >
                      Back to integration selection
                    </Button>
                    <Button
                      disabled={selectedScanner === undefined}
                      onClick={() => api?.scrollNext()}
                    >
                      {selectedScanner === undefined
                        ? "Select a scanner"
                        : "Continue"}
                    </Button>
                  </div>
                </CarouselItem>

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
                            console.log(resp);
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
