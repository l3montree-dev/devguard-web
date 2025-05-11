import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import Image from "next/image";
import React, { FunctionComponent, useEffect } from "react";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import usePersonalAccessToken from "../hooks/usePersonalAccessToken";
import { integrationSnippets } from "../integrationSnippets";
import { classNames } from "../utils/common";
import CopyCode from "./common/CopyCode";
import { GithubTokenSlides } from "./risk-identification/GithubTokenInstructions";
import { GitlabTokenSlides } from "./risk-identification/GitlabTokenInstructions";
import { Button } from "./ui/button";
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

interface CodeRiskScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
}

const CodeRiskScannerDialog: FunctionComponent<CodeRiskScannerDialogProps> = ({
  open,
  apiUrl,
  onOpenChange,
}) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [count, setCount] = React.useState(0);
  const [current, setCurrent] = React.useState(0);
  const [selectedScanner, setSelectedScanner] = React.useState<
    "secret-scanning" | "iac" | "sast" | "custom" | "devsecops"
  >();
  const [selectedIntegration, setSelectedIntegration] = React.useState<
    "github" | "gitlab" | "docker"
  >();
  const activeOrg = useActiveOrg();
  const activeProject = useActiveProject();
  const asset = useActiveAsset();

  const pat = usePersonalAccessToken();

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setCount(api.scrollSnapList().length);
    });
  }, [api]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <span className="text-sm text-muted-foreground">
          {current} / {count}
        </span>
        <Carousel
          opts={{
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
                          dependency risk identification. This is only possible
                          through CI/CD Components and GitHub-Actions.
                        </CardDescription>
                      </CardHeader>
                    </CardContent>
                  </Card>
                )}
                <Card
                  onClick={() => setSelectedScanner("secret-scanning")}
                  className={classNames(
                    "cursor-pointer ",
                    selectedScanner === "secret-scanning"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                >
                  <CardContent className="p-0">
                    <CardHeader>
                      <CardTitle className="text-lg">Secret-Scanning</CardTitle>
                      <CardDescription>
                        Secret-Scanning is a process of scanning your code for
                        hardcoded secrets, such as API keys, passwords, and
                        tokens. It helps to prevent unauthorized access to your
                        systems and data.
                      </CardDescription>
                    </CardHeader>
                  </CardContent>
                </Card>
                <Card
                  onClick={() => setSelectedScanner("sast")}
                  className={classNames(
                    "cursor-pointer",
                    selectedScanner === "sast"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                >
                  <CardContent className="p-0">
                    <CardHeader>
                      <CardTitle className="text-lg leading-tight">
                        Static-Application-Security-Testing
                      </CardTitle>
                      <CardDescription>
                        Static Application Security Testing (SAST) is a method
                        of debugging by examining source code before a program
                        is run. SAST tools scan source code for coding errors,
                        vulnerabilities, and other security issues.
                      </CardDescription>
                    </CardHeader>
                  </CardContent>
                </Card>
                <Card
                  onClick={() => setSelectedScanner("iac")}
                  className={classNames(
                    "cursor-pointer",
                    selectedScanner === "iac"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                >
                  <CardContent className="p-0">
                    <CardHeader>
                      <CardTitle className="text-lg leading-tight">
                        Infrastructure as Code Scanning
                      </CardTitle>
                      <CardDescription>
                        Infrastructure as Code (IaC) scanning is a process of
                        scanning your infrastructure code for security
                        vulnerabilities and compliance issues. It helps to
                        ensure that your infrastructure is secure and compliant
                        with industry standards.
                      </CardDescription>
                    </CardHeader>
                  </CardContent>
                </Card>

                <Card
                  className={classNames(
                    "cursor-pointer",
                    selectedScanner === "custom"
                      ? "border border-primary"
                      : "border border-transparent",
                  )}
                  onClick={() => setSelectedScanner("custom")}
                >
                  <CardContent className="p-0">
                    <CardHeader>
                      <CardTitle className="text-lg leading-tight">
                        I bring my own scanner
                      </CardTitle>
                      <CardDescription>
                        You can integrate any scanner, which is able to produce
                        a SARIF-Report.
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
                    Use our docker image to run the scanner in any environment
                    which is capable of running docker.
                  </DialogDescription>
                  <div className="mt-10">
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
                    <Button onClick={() => api?.scrollNext()}>Done!</Button>
                  </div>
                </CarouselItem>
              </>
            )}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default CodeRiskScannerDialog;
