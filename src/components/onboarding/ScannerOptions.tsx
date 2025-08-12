// Copyright 2025 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useActiveAsset } from "@/hooks/useActiveAsset";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { useEffect, useState } from "react";
import { GithubTokenSlides } from "../risk-identification/GithubTokenInstructions";
import { GitlabTokenSlides } from "../risk-identification/GitlabTokenInstructions";
import { Button } from "../ui/button";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { CarouselApi, CarouselItem } from "../ui/carousel";
import { Checkbox } from "../ui/checkbox";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import Section from "../common/Section";
import { AssetDTO } from "../../types/api/api";

interface Config {
  "secret-scanning": boolean;
  sca: boolean;
  "container-scanning": boolean;
  sast: boolean;
  iac: boolean;
  build: boolean;
}

export const ScannerOptions = ({
  api,
  apiUrl,
  setup,
  next,
  prev,
  orgSlug,
  projectSlug,
  assetSlug,
}: {
  next?: () => void;
  prev?: () => void;
  setup?: "own" | "auto-setup";
  api?: CarouselApi;
  apiUrl: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
}) => {
  const pat = usePersonalAccessToken();

  const asset = useActiveAsset();

  const [config, setConfig] = useState<Config>({
    "secret-scanning": true,
    sca: true,
    "container-scanning": true,
    sast: true,
    iac: true,
    build: true,
  });

  const [gitInstance, setGitInstance] =
    useState<AssetDTO["repositoryProvider"]>("gitlab");

  useEffect(() => {
    api?.reInit();
  }, [api, config, gitInstance]);

  console.log(config);

  return (
    <>
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>
            Select the Scans you need from the DevGuard Default Tool Set
          </DialogTitle>
          <DialogDescription>
            Choose from our curated list of scan and scanner setups to
            integrate.
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <div
            className="relative aspect-video w-full
            max-w-4xl b"
          >
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
                          build: true,
                          "secret-scanning": true,
                          sca: true,
                          "container-scanning": true,
                          sast: true,
                          iac: true,
                        }));
                      } else {
                        setConfig(() => ({
                          ...config,
                          build: false,
                          "secret-scanning": false,
                          sca: false,
                          "container-scanning": false,
                          sast: false,
                          iac: false,
                        }));
                      }
                    }}
                    checked={Object.values(config).every(
                      (property) => property === true,
                    )}
                  />
                  <div>
                    <div className="flex flex-col">
                      <CardTitle className=" text-base">
                        Whole Pipeline
                      </CardTitle>
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
              <Card className="">
                <div className="align-middle flex flex-col space-y-4 p-4">
                  <div className="flex flex-row items-center space-x-4">
                    <Checkbox
                      defaultChecked={true}
                      checked={config["secret-scanning"]}
                      onCheckedChange={() =>
                        setConfig(() => ({
                          ...config,
                          "secret-scanning": !config["secret-scanning"],
                        }))
                      }
                    />
                    <div>
                      <span>Identify leaked Secrets in your Code</span>
                      <p className="text-muted-foreground text-xs">
                        Detected leaked Tokens, Passwords, anything the public
                        should not know
                      </p>
                    </div>
                  </div>
                  <div className="align-middle flex flex-col space-y-4">
                    <div className="flex flex-row items-center space-x-4">
                      <Checkbox
                        defaultChecked={true}
                        checked={config.sca}
                        onCheckedChange={() =>
                          setConfig(() => ({
                            ...config,
                            sca: !config.sca,
                          }))
                        }
                      />
                      <div>
                        <span>
                          Scan your Dependencies for known Vulnerabilities (SCA)
                        </span>
                        <p className="text-muted-foreground text-xs">
                          Assess open-source and third-party dependencies,
                          detect known vulnerabilities in dependencies (known as
                          Software Composition Analysis (SCA))
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="align-middle flex flex-col space-y-4">
                    <div className="flex flex-row items-center space-x-4">
                      <Checkbox
                        defaultChecked={true}
                        checked={config["container-scanning"]}
                        onCheckedChange={() =>
                          setConfig(() => ({
                            ...config,
                            build: !config.build,
                            "container-scanning": !config["container-scanning"],
                          }))
                        }
                      />
                      <div>
                        <span>Build & Scan your Container Image</span>
                        <p className="text-muted-foreground text-xs">
                          You have a Dockerfile in your Repo? Build it and scan
                          your container image for known vulnerabilities.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="align-middle flex flex-col space-y-4">
                    <div className="flex flex-row items-center space-x-4">
                      <Checkbox
                        defaultChecked={true}
                        checked={config.sast}
                        onCheckedChange={() =>
                          setConfig(() => ({
                            ...config,
                            sast: !config.sast,
                          }))
                        }
                      />
                      <div>
                        <span>Identify Bad Practices in Your Code (SAST)</span>
                        <p className="text-muted-foreground text-xs">
                          Analyzes your code to find bad practices and potential
                          security vulnerabilities in your own code (known as
                          Static Application Security Testing (SAST)).
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="align-middle flex flex-col space-y-4">
                    <div className="flex flex-row items-center space-x-4">
                      <Checkbox
                        defaultChecked={true}
                        checked={config.iac}
                        onCheckedChange={() =>
                          setConfig(() => ({
                            ...config,
                            iac: !config.iac,
                          }))
                        }
                      />
                      <div>
                        <span>
                          Identify Flaws in your Infrastructure Configs (IaC)
                        </span>
                        <p className="text-muted-foreground text-xs">
                          Detects misconfigurations and vulnerabilities in
                          infrastructure as code (IaC) files, such as
                          Dockerfiles, Kubernetes configs, Workflows, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Section>
          </div>
        </div>

        <div className="mt-10 flex flex-row gap-2 justify-end">
          <Button variant={"secondary"} onClick={() => prev?.()}>
            Back
          </Button>
          <Button
            disabled={Object.values(config).every((v) => v === false)}
            onClick={() => {
              next?.();
            }}
          >
            {Object.values(config).every((v) => v === false)
              ? "Select Option"
              : "Continue"}
          </Button>
        </div>
      </CarouselItem>
      {asset?.repositoryProvider === "github" && (
        <GithubTokenSlides
          api={api}
          apiUrl={apiUrl}
          orgSlug={orgSlug}
          projectSlug={projectSlug}
          assetSlug={assetSlug}
          pat={pat.pat?.privKey}
          prev={api?.scrollPrev}
          next={api?.scrollNext}
          config={config}
        />
      )}
      {asset?.repositoryProvider === "gitlab" && (
        <GitlabTokenSlides
          api={api}
          apiUrl={apiUrl}
          orgSlug={orgSlug}
          projectSlug={projectSlug}
          assetSlug={assetSlug}
          pat={pat.pat?.privKey}
          prev={api?.scrollPrev}
          next={api?.scrollNext}
          config={config}
        />
      )}
    </>
  );
};
export default ScannerOptions;
