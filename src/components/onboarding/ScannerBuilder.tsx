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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { GitInstances } from "@/types/common";
import ProviderTitleIcon from "../common/ProviderTitleIcon";
import { Outline } from "@react-three/postprocessing";
import { classNames } from "@/utils/common";

interface Config {
  identifySecrets: boolean;
  SCA: boolean;
  containerImage: boolean;
  SAST: boolean;
  IaC: boolean;
}

export const ScannerBuilder = ({
  api,
  setup,
  next,
  prev,
}: {
  next?: () => void;
  prev?: () => void;
  setup?: "own" | "auto-setup";
  api?: CarouselApi;
}) => {
  const [ready, setReady] = useState(false);

  const [config, setConfig] = useState<Config>({
    identifySecrets: true,
    SCA: true,
    containerImage: true,
    SAST: true,
    IaC: true,
  });

  type gitInstance = "gitlab" | "github" | undefined;

  const [gitInstance, setGitInstance] = useState<gitInstance>("gitlab");

  useEffect(() => {
    api?.reInit();
    setReady(true); //this is redundant rn, will change
  }, [api, config, gitInstance]);

  function codeStringBuilder(config: Config, gitInstance: gitInstance) {
    Object.values(config).every((configSetting) =>
      configSetting === true
        ? console.log("blabla")
        : console.log("i dont work"),
    );

    const codeString: string = "\ntest \ntest\n";
    if (gitInstance === "github") {
      codeString + "\n github \n\n\n\n\n\n\n\n\n\n\n\n\n\n";
    } else {
      codeString + "\n github \n\n\n\n\n\n\n\n\n\n\n\n\n\n";
    }
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
            <div className="mt-10 flex w-full justify-end ">
              <Card className="h-auto w-48">
                <div className="flex flex-grid space-x-4 m-2">
                  <Switch
                    className="mt-4"
                    defaultChecked={true}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setConfig(() => ({
                          ...config,
                          identifySecrets: true,
                          SCA: true,
                          containerImage: true,
                          SAST: true,
                          IaC: true,
                        }));
                      } else {
                        setConfig(() => ({
                          ...config,
                          identifySecrets: false,
                          SCA: false,
                          containerImage: false,
                          SAST: false,
                          IaC: false,
                        }));
                      }
                    }}
                    checked={Object.values(config).every((v) => v === true)}
                  />
                  <div className="flex flex-col">
                    <CardTitle className=" text-base">Whole Pipeline</CardTitle>
                    <CardDescription className="">
                      Enable this to use full Pipeline.
                    </CardDescription>
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
                    checked={config.identifySecrets}
                    onCheckedChange={() =>
                      setConfig(() => ({
                        ...config,
                        identifySecrets: !config.identifySecrets,
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
                      checked={config.SCA}
                      onCheckedChange={() =>
                        setConfig(() => ({
                          ...config,
                          SCA: !config.SCA,
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
                      checked={config.containerImage}
                      onCheckedChange={() =>
                        setConfig(() => ({
                          ...config,
                          containerImage: !config.containerImage,
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
                      checked={config.SAST}
                      onCheckedChange={() =>
                        setConfig(() => ({
                          ...config,
                          SAST: !config.SAST,
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
                      checked={config.IaC}
                      onCheckedChange={() =>
                        setConfig(() => ({
                          ...config,
                          IaC: !config.IaC,
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
                  gitInstance === "github"
                    ? "border border-primary"
                    : "border border-transparent",
                )}
                onClick={() => setGitInstance("github")}
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
                  gitInstance === "gitlab"
                    ? "border border-primary"
                    : "border border-transparent",
                )}
                onClick={() => {
                  setGitInstance("gitlab");
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
        <CarouselItem className="h-128">
          <DialogHeader>
            <DialogTitle>
              Add the snippet to your GitHub Actions File
            </DialogTitle>
            <DialogDescription>
              Create a new{" "}
              <CopyCodeFragment codeString=".github/workflows/devsecops.yml" />{" "}
              file or add the code snippet to an existing workflow file.
            </DialogDescription>
          </DialogHeader>
          <CopyCode
            codeString={codeStringBuilder(config, gitInstance)}
          ></CopyCode>
          <div className="mt-10 flex flex-row gap-2 justify-end">
            <Button variant={"secondary"} onClick={() => prev?.()}>
              Back
            </Button>
            ,
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
