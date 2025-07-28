// Copyright 2025 larshermges
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2024 Tim Bastin, l3montree GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import Image from "next/image";
import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { CarouselApi, CarouselItem } from "../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import CopyCode, { CopyCodeFragment } from "../common/CopyCode";
import { integrationSnippets } from "../../integrationSnippets";
import { classNames } from "@/utils/common";
import { concat } from "lodash";

interface Config {
  "secret-scanning": boolean;
  sca: boolean;
  "container-scanning": boolean;
  sast: boolean;
  iac: boolean;
}

interface gitlabOptionsYaml {
  "secret-scanning": string;
  SCA: string;
  "container-scanning": string;
  SAST: string;
  IaC: string;
}

export const ScannerBuilder = ({
  api,
  apiUrl,
  setup,
  next,
  prev,
  pat,
  onPatGenerate,
  orgSlug,
  projectSlug,
  assetSlug,
}: {
  next?: () => void;
  prev?: () => void;
  setup?: "own" | "auto-setup";
  api?: CarouselApi;
  apiUrl: string;
  pat?: string;
  onPatGenerate: () => void;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
}) => {
  const [ready, setReady] = useState(false);

  const [config, setConfig] = useState<Config>({
    "secret-scanning": true,
    sca: true,
    "container-scanning": true,
    sast: true,
    iac: true,
  });

  type gitInstance = "Gitlab" | "GitHub";

  const [gitInstance, setGitInstance] = useState<gitInstance>("Gitlab");

  useEffect(() => {
    api?.reInit();
    setReady(true); //this is redundant rn, will change
  }, [api, config, gitInstance]);

  function codeStringBuilder() {
    const base = gitInstance === "GitHub" ? "Github" : "Gitlab";
    const codeString = Object.entries(config)
      .filter(([_, selectedOptionValue]) => selectedOptionValue)
      .map(([selectedOption]) => {
        return integrationSnippets({
          orgSlug,
          projectSlug,
          assetSlug,
          apiUrl,
        })[gitInstance][selectedOption as keyof Config];
      })
      .map((value) => value)
      .join("\n");
    return codeString;
  }

  return (
    <>
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>What should your Scanner be able to do?</DialogTitle>
          <DialogDescription>Select exactly what you want</DialogDescription>
        </DialogHeader>
        <div className="">
          <div
            className="relative aspect-video w-full
            max-w-4xl b"
          >
            <div className="mt-10 flex w-full  ">
              <Card className="h-auto w-full align-middle space-y-4">
                <div className="flex flex-row  items-center space-x-4 m-2">
                  <Switch
                    className="items-center"
                    defaultChecked={true}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setConfig(() => ({
                          ...config,
                          "secret-scanning": true,
                          sca: true,
                          "container-scanning": true,
                          sast: true,
                          iac: true,
                        }));
                      } else {
                        setConfig(() => ({
                          ...config,
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
            <h3 className="mt-4 mb-2">What should Devguard do for you?</h3>
            <Card className="">
              <div className="align-middle flex flex-col space-y-4 ml-2">
                <div className="flex flex-row items-center space-x-2">
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
                    <span> Identify leaked Secrets in your Code</span>
                    <p className="text-muted-foreground text-xs">
                      Tokens, Passwords, anything you the public should not
                      know, will be scanned
                    </p>
                  </div>
                </div>
                <div className="align-middle flex flex-col space-y-4">
                  <div className="flex flex-row items-center space-x-2">
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
                        Assess open-source and third-party dependencies, detect
                        known vulnerabilities in dependencies
                      </p>
                    </div>
                  </div>
                </div>
                <div className="align-middle flex flex-col space-y-4">
                  <div className="flex flex-row items-center space-x-2">
                    <Checkbox
                      defaultChecked={true}
                      checked={config["container-scanning"]}
                      onCheckedChange={() =>
                        setConfig(() => ({
                          ...config,
                          "container-scanning": !config["container-scanning"],
                        }))
                      }
                    />
                    <div>
                      <span>Build your Container Image</span>
                      <p className="text-muted-foreground text-xs">
                        Scans container images for vulnerabilities and helps
                        maintain environment
                      </p>
                    </div>
                  </div>
                </div>
                <div className="align-middle flex flex-col space-y-4">
                  <div className="flex flex-row items-center space-x-2">
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
                        Analyzes source code to find security vulnerabilities in
                        the development process
                      </p>
                    </div>
                  </div>
                </div>
                <div className="align-middle flex flex-col space-y-4">
                  <div className="flex flex-row items-center space-x-2">
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
                        Detects misconfigurations and vulnerabilities in IaC
                        templates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <Separator className="mt-4" orientation="horizontal" />
            <h3 className="mt-4 mb-2">What Git Instance are you using?</h3>

            <div className="flex w-full">
              <Button
                variant={"ghost"}
                className={classNames(
                  "w-full",
                  gitInstance === "GitHub"
                    ? "border border-primary"
                    : "border border-transparent",
                )}
                onClick={() => setGitInstance("GitHub")}
              >
                <Image
                  src="/assets/github.svg"
                  alt="GitHub Logo"
                  className="mr-2 dark:invert"
                  width={24}
                  height={24}
                />
                GitHub
              </Button>
              {/* border dark:border-foreground/20 !text-foreground
              hover:no-underline bg-transparent hover:bg-accent
              hover:text-accent-foreground */}
              <Button
                variant={"ghost"}
                className={classNames(
                  "w-full",
                  gitInstance === "Gitlab"
                    ? "border border-primary"
                    : "border border-transparent",
                )}
                onClick={() => {
                  setGitInstance("Gitlab");
                }}
              >
                <Image
                  src="/assets/gitlab.svg"
                  alt="GitHub Logo"
                  className="mr-2"
                  width={24}
                  height={24}
                />
                GitLab
              </Button>
            </div>
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

      {ready === true && (
        <CarouselItem className="">
          <DialogHeader>
            {gitInstance === "GitHub" && (
              <DialogTitle>
                Add the snippet to your GitHub Actions File
              </DialogTitle>
            )}
            {gitInstance === "Gitlab" && (
              <DialogTitle>
                Add the snippet to your GitLab CI/CD File
              </DialogTitle>
            )}
            <DialogDescription>
              Create a new
              <CopyCodeFragment
                codeString={`.${gitInstance}/workflows/devsecops.yml`}
              />
              file or add the code snippet to an existing workflow file.
            </DialogDescription>
          </DialogHeader>
          <CopyCode
            language="yaml"
            codeString={`# .github/workflows/devsecops.yml ${codeStringBuilder()} `}
          ></CopyCode>
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
      )}
    </>
  );
};

export default ScannerBuilder;
