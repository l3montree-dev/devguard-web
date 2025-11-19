// Copyright 2025 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import React, { FunctionComponent } from "react";
import { CarouselItem } from "../../ui/carousel";
import { Button } from "../../ui/button";
import { Card, CardDescription, CardTitle } from "../../ui/card";
import { Checkbox } from "../../ui/checkbox";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import Section from "../../common/Section";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { Config } from "@/types/common";

interface ScannerOptionsSelectionSlideProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  api?: {
    scrollTo: (index: number) => void;
    reInit: () => void;
  };
  tokenSlideIndex: number;
  prevIndex: number;
}

const ScannerOptionsSelectionSlide: FunctionComponent<
  ScannerOptionsSelectionSlideProps
> = ({ config, setConfig, api, tokenSlideIndex, prevIndex }) => {
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Select the Scans you need from the DevGuard Default Tool Set
        </DialogTitle>
        <DialogDescription>
          Choose from our curated list of scan and scanner setups to integrate.
        </DialogDescription>
      </DialogHeader>
      <div className="">
        <div className="relative aspect-video w-full max-w-4xl b">
          <div className="mt-10 flex w-full">
            <Card className="h-auto w-full align-middle space-y-4 p-4">
              <div className="flex flex-row  items-center space-x-4">
                <Switch
                  className="items-center"
                  defaultChecked={true}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfig(() => ({
                        ...config,
                        "secret-scanning": true,
                        sast: true,
                        iac: true,
                        sca: true,
                        "container-scanning": true,
                        build: true,
                        push: true,
                        sign: true,
                        attest: true,
                      }));
                    } else {
                      setConfig(() => ({
                        ...config,
                        "secret-scanning": false,
                        sast: false,
                        iac: false,
                        sca: false,
                        "container-scanning": false,
                        build: false,
                        push: false,
                        sign: false,
                        attest: false,
                      }));
                    }
                  }}
                  checked={
                    config["secret-scanning"] &&
                    config.sast &&
                    config.iac &&
                    config.sca &&
                    config["container-scanning"] &&
                    config.build &&
                    config.push &&
                    config.sign &&
                    config.attest
                  }
                />
                <div>
                  <div className="flex flex-col">
                    <CardTitle className=" text-base">Whole Pipeline</CardTitle>
                    <CardDescription className="">
                      Enable this to use full Pipeline.
                    </CardDescription>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Separator className="mt-4" orientation="horizontal" />
          <Section forceVertical title="What should DevGuard do?">
            <Card>
              <div className="align-middle flex flex-col space-y-4 p-4">
                <Collapsible onOpenChange={() => api?.reInit()}>
                  <div className="flex cursor-pointer flex-row items-center justify-between">
                    <div className="flex flex-row items-center space-x-4 ">
                      <Checkbox
                        id="first-party-secret-scanning"
                        defaultChecked={true}
                        checked={
                          config["secret-scanning"] && config.sast && config.iac
                        }
                        onCheckedChange={() =>
                          setConfig((currentConfig) => {
                            const newValue = !(
                              currentConfig["secret-scanning"] &&
                              currentConfig.sast &&
                              currentConfig.iac
                            );
                            return {
                              ...currentConfig,
                              "secret-scanning": newValue,
                              sast: newValue,
                              iac: newValue,
                            };
                          })
                        }
                      />
                      <label
                        htmlFor="first-party-secret-scanning"
                        className="cursor-pointer"
                      >
                        <span>
                          Scan the First Party Security Issues in Your Code
                        </span>
                      </label>
                    </div>
                    <CollapsibleTrigger className="flex-1 text-right">
                      <CaretDownIcon className="inline-block h-4 w-4 " />
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="ml-6 mt-2">
                    <div className="flex flex-row items-center space-x-4">
                      <Checkbox
                        id="secret-scanning"
                        defaultChecked={true}
                        checked={config["secret-scanning"]}
                        onCheckedChange={() =>
                          setConfig(() => ({
                            ...config,
                            "secret-scanning": !config["secret-scanning"],
                          }))
                        }
                      />
                      <label
                        htmlFor="secret-scanning"
                        className="cursor-pointer"
                      >
                        <span>Identify leaked Secrets in your Code</span>
                        <p className="text-muted-foreground text-xs">
                          Detected leaked Tokens, Passwords, anything the public
                          should not know
                        </p>
                      </label>
                    </div>
                    <div className="align-middle flex flex-col space-y-4">
                      <div className="flex flex-row items-center space-x-4">
                        <Checkbox
                          id="sast"
                          defaultChecked={true}
                          checked={config.sast}
                          onCheckedChange={() =>
                            setConfig(() => ({
                              ...config,
                              sast: !config.sast,
                            }))
                          }
                        />
                        <label htmlFor="sast" className="cursor-pointer">
                          <span>
                            Identify Bad Practices in Your Code (SAST)
                          </span>
                          <p className="text-muted-foreground text-xs">
                            Analyzes your code to find bad practices and
                            potential security vulnerabilities in your own code
                            (known as Static Application Security Testing
                            (SAST)).
                          </p>
                        </label>
                      </div>
                    </div>
                    <div className="align-middle flex flex-col space-y-4">
                      <div className="flex flex-row items-center space-x-4">
                        <Checkbox
                          id="iac"
                          defaultChecked={true}
                          checked={config.iac}
                          onCheckedChange={() =>
                            setConfig(() => ({
                              ...config,
                              iac: !config.iac,
                            }))
                          }
                        />
                        <label htmlFor="iac" className="cursor-pointer">
                          <span>
                            Identify Flaws in your Infrastructure Configs (IaC)
                          </span>
                          <p className="text-muted-foreground text-xs">
                            Detects misconfigurations and vulnerabilities in
                            infrastructure as code (IaC) files, such as
                            Dockerfiles, Kubernetes configs, Workflows, etc.
                          </p>
                        </label>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div>
                  <div className="align-middle flex flex-col space-y-4">
                    <div className="flex flex-row items-center space-x-4">
                      <Checkbox
                        id="sca"
                        defaultChecked={true}
                        checked={config.sca}
                        onCheckedChange={() =>
                          setConfig(() => ({
                            ...config,
                            sca: !config.sca,
                          }))
                        }
                      />
                      <label htmlFor="sca" className="cursor-pointer">
                        <span>
                          Scan your Source Code Dependencies for Vulnerabilities
                          (SCA)
                        </span>
                        <p className="text-muted-foreground text-xs">
                          Assess open-source and third-party dependencies,
                          detect known vulnerabilities in dependencies (known as
                          Software Composition Analysis (SCA))
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <Collapsible onOpenChange={() => api?.reInit()}>
                  <div className="flex cursor-pointer flex-row items-center justify-between">
                    <div className="flex flex-row items-center space-x-4">
                      <Checkbox
                        id="oci-image"
                        defaultChecked={true}
                        checked={
                          config["container-scanning"] &&
                          config.build &&
                          config.push
                        }
                        onCheckedChange={() =>
                          setConfig((currentConfig) => {
                            const newValue = !(
                              currentConfig["container-scanning"] &&
                              currentConfig.build &&
                              currentConfig.push
                            );
                            return {
                              ...currentConfig,
                              "container-scanning": newValue,
                              build: newValue,
                              push: newValue,
                            };
                          })
                        }
                      />
                      <label htmlFor="oci-image" className="cursor-pointer">
                        <span>Scan and Build your Container Images</span>
                      </label>
                    </div>
                    <CollapsibleTrigger className="flex-1 text-right">
                      <CaretDownIcon className="inline-block h-4 w-4 " />
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="ml-6 mt-2">
                    <div className="align-middle flex flex-col space-y-4">
                      <div className="flex flex-row items-center space-x-4">
                        <Checkbox
                          id="build"
                          defaultChecked={true}
                          checked={config["build"]}
                          onCheckedChange={() =>
                            setConfig(() => ({
                              ...config,
                              build: !config.build,
                            }))
                          }
                        />
                        <label htmlFor="build" className="cursor-pointer">
                          <span>Build your Container Image</span>
                          <p className="text-muted-foreground text-xs">
                            Build your container image using DevGuard&apos;s
                            optimized build process.
                          </p>
                        </label>
                      </div>
                    </div>
                    <div className="align-middle flex flex-col space-y-4">
                      <div className="flex flex-row items-center space-x-4">
                        <Checkbox
                          id="container-scanning"
                          defaultChecked={true}
                          checked={config["container-scanning"]}
                          onCheckedChange={() =>
                            setConfig(() => ({
                              ...config,
                              "container-scanning":
                                !config["container-scanning"],
                            }))
                          }
                        />
                        <label
                          htmlFor="container-scanning"
                          className="cursor-pointer"
                        >
                          <span>
                            Scan your Container Image for Vulnerabilities
                          </span>
                          <p className="text-muted-foreground text-xs">
                            Analyze your container images to detect known
                            vulnerabilities in the OS packages and libraries
                            included in the image.
                          </p>
                        </label>
                      </div>
                    </div>
                    <div className="align-middle flex flex-col space-y-4">
                      <div className="flex flex-row items-center space-x-4">
                        <Checkbox
                          id="push"
                          defaultChecked={true}
                          checked={config["push"]}
                          onCheckedChange={() =>
                            setConfig(() => ({
                              ...config,
                              push: !config.push,
                            }))
                          }
                        />
                        <label htmlFor="push" className="cursor-pointer">
                          <span>Push your Container Image to Registry</span>
                          <p className="text-muted-foreground text-xs">
                            Push the built container image to your specified
                            container registry.
                          </p>
                        </label>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible onOpenChange={() => api?.reInit()}>
                  <div className="flex cursor-pointer flex-row items-center justify-between">
                    <div className="flex flex-row items-center space-x-4">
                      <Checkbox
                        id="attestation"
                        defaultChecked={true}
                        checked={config.sign && config.attest}
                        onCheckedChange={() =>
                          setConfig((currentConfig) => {
                            const newValue = !(
                              currentConfig.sign && currentConfig.attest
                            );
                            return {
                              ...currentConfig,
                              sign: newValue,
                              attest: newValue,
                            };
                          })
                        }
                      />
                      <label htmlFor="attestation" className="cursor-pointer">
                        <span>Sign and Attest your Container Images</span>
                      </label>
                    </div>
                    <CollapsibleTrigger className="flex-1 text-right">
                      <CaretDownIcon className="inline-block h-4 w-4 " />
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="ml-6 mt-2">
                    <div className="align-middle flex flex-col space-y-4">
                      <div className="flex flex-row items-center space-x-4">
                        <Checkbox
                          id="sign"
                          defaultChecked={true}
                          checked={config["sign"]}
                          onCheckedChange={() =>
                            setConfig(() => ({
                              ...config,
                              sign: !config.sign,
                            }))
                          }
                        />
                        <label htmlFor="sign" className="cursor-pointer">
                          <span>Sign your Container Image</span>
                          <p className="text-muted-foreground text-xs">
                            Sign your container image using DevGuard&apos;s
                            attestation service.
                          </p>
                        </label>
                      </div>
                    </div>
                    <div className="align-middle flex flex-col space-y-4">
                      <div className="flex flex-row items-center space-x-4">
                        <Checkbox
                          id="attest"
                          defaultChecked={true}
                          checked={config["attest"]}
                          onCheckedChange={() =>
                            setConfig(() => ({
                              ...config,
                              attest: !config.attest,
                            }))
                          }
                        />
                        <label htmlFor="attest" className="cursor-pointer">
                          <span>Attest your Container Image</span>
                          <p className="text-muted-foreground text-xs">
                            Attest your container image to provide metadata
                            about its build and security status.
                          </p>
                        </label>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </Card>
            <div className="flex flex-row gap-2 mb-4">
              <Collapsible
                className="w-full"
                onOpenChange={() => api?.reInit()}
              >
                <CollapsibleTrigger className="text-muted-foreground flex flex-row justify-between w-full mt-4 pb-2 cursor-pointer text-sm">
                  More Options
                  <CaretDownIcon className="ml-2 inline-block h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="">
                  <div>
                    <div className="align-middle flex flex-col space-y-4">
                      <div className="flex flex-row items-center space-x-4">
                        <Checkbox
                          id="sbom"
                          defaultChecked={false}
                          checked={config.sbom}
                          onCheckedChange={() =>
                            setConfig(() => ({
                              ...config,
                              sbom: !config.sbom,
                            }))
                          }
                        />
                        <label htmlFor="sbom" className="cursor-pointer">
                          <span>
                            Scan a Software Bill of Materials (SBOM) for
                            Vulnerabilities
                          </span>
                          <p className="text-muted-foreground text-xs">
                            Upload an SBOM file generated by another tool for
                            analysis
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="align-middle flex flex-col space-y-4">
                      <div className="flex flex-row items-center space-x-4">
                        <Checkbox
                          id="sarif"
                          defaultChecked={false}
                          checked={config.sarif}
                          onCheckedChange={() =>
                            setConfig(() => ({
                              ...config,
                              sarif: !config.sarif,
                            }))
                          }
                        />
                        <label htmlFor="sarif" className="cursor-pointer">
                          <span>Scan a SARIF File for Vulnerabilities</span>
                          <p className="text-muted-foreground text-xs">
                            Upload a SARIF file generated by another tool for
                            analysis
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </Section>
        </div>
      </div>

      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button
          variant={"secondary"}
          id="scanner-options-selection-back"
          onClick={() => api?.scrollTo(prevIndex)}
        >
          Back
        </Button>
        <Button
          disabled={Object.values(config).every((v) => v === false)}
          id="scanner-options-selection-continue"
          onClick={() => {
            api?.scrollTo(tokenSlideIndex); // Go to token slide
          }}
        >
          {Object.values(config).every((v) => v === false)
            ? "Select Option"
            : "Continue"}
        </Button>
      </div>
    </CarouselItem>
  );
};

export default ScannerOptionsSelectionSlide;
