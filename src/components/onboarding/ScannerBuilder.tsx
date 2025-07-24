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

import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CarouselApi, CarouselItem } from "../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Accordion } from "../ui/accordion";
import Callout from "../common/Callout";
import { classNames } from "@/utils/common";
import { Form } from "react-hook-form";
import { Button } from "../ui/button";
import { setConfig } from "next/config";
import { config } from "process";

export const ScannerBuilder = ({
  setup,
}: {
  next?: () => void;
  prev?: () => void;

  setup?: "own" | "auto-setup";
}) => {
  const [api, setApi] = React.useState<CarouselApi>();

  interface Config {
    identifySecrets: boolean;
    SCA: boolean;
    containerImage: boolean;
    SAST: boolean;
    IaC: boolean;
  }
  const [config, setConfig] = useState<Partial<Config>>({
    identifySecrets: true,
    SCA: true,
    containerImage: true,
    SAST: true,
    IaC: true,
  });

  useEffect(() => {
    api?.reInit();
    console.log(config);
  }, []);
  // selectedScanner, selectedIntegration, pat.pat, api;

  return (
    <>
      <CarouselItem>
        <DialogHeader>
          <DialogTitle>What should your Scanner be able to do?</DialogTitle>
          <DialogDescription>Select exactly what you want</DialogDescription>
        </DialogHeader>
        <div className="mt-10">
          <div
            className="relative aspect-video w-full
            max-w-4xl b"
          >
            <div className="flex w-full justify-end ">
              <div className="mr-2">Disable all</div>
              <Checkbox
                defaultChecked={false}
                onCheckedChange={() =>
                  setConfig({
                    identifySecrets: false,
                    SCA: false,
                    containerImage: false,
                    SAST: false,
                    IaC: false,
                  })
                }
                // checked={}
              />
            </div>

            <Card
              className=" border-yellow-300 bg-yellow-500/20 text-yellow-950
            dark:border-yellow-700 dark:text-yellow-100 "
            >
              You are currently using the Full DevSecOps Pipeline
            </Card>

            <Separator className="mt-4" orientation="horizontal" />
            <h3 className="mt-4 mb-2">What should Devguard do for you?</h3>
            <Card className="">
              <div className="flex flex-col space-y-4 ml-2">
                <div className="space-x-2">
                  <Checkbox
                    defaultChecked={true}
                    checked={config.identifySecrets}
                    onCheckedChange={() =>
                      setConfig({
                        identifySecrets: !config.identifySecrets,
                      })
                    }
                  />
                  <span> Identify leaked Secrets in your Code</span>
                  <p className="text-muted-foreground text-xs">
                    Tokens, Passwords, anything you the public should not know,
                    will be scanned
                  </p>
                </div>
                <div className="space-x-2">
                  <Checkbox
                    defaultChecked={true}
                    checked={config.identifySecrets}
                    onCheckedChange={() =>
                      setConfig({
                        identifySecrets: !config.identifySecrets,
                      })
                    }
                  />
                  <span>
                    Scan your Dependencies for known Vulnerabilities (SCA)
                  </span>
                  <p className="text-muted-foreground text-xs">
                    By clicking this checkbox, you agree to the terms and
                    conditions
                  </p>
                </div>
                <div className="space-x-2">
                  <Checkbox
                    defaultChecked={true}
                    checked={config.identifySecrets}
                    onCheckedChange={() =>
                      setConfig({
                        identifySecrets: !config.identifySecrets,
                      })
                    }
                  />
                  <span>Build your Container Image</span>
                  <p className="text-muted-foreground text-xs">
                    By clicking this checkbox, you agree to the terms and
                    conditions
                  </p>
                </div>
                <div className="space-x-2">
                  <Checkbox
                    defaultChecked={true}
                    checked={config.identifySecrets}
                    onCheckedChange={() =>
                      setConfig({
                        identifySecrets: !config.identifySecrets,
                      })
                    }
                  />
                  <span>Identify Bad Practices in Your Code (SAST)</span>
                  <p className="text-muted-foreground text-xs">
                    By clicking this checkbox, you agree to the terms and
                    conditions
                  </p>
                </div>
                <div className="space-x-2">
                  <Checkbox
                    defaultChecked={true}
                    checked={config.identifySecrets}
                    onCheckedChange={() =>
                      setConfig({
                        identifySecrets: !config.identifySecrets,
                      })
                    }
                  />
                  <span>
                    Identify Flaws in your Infrastructure Configs (IaC)
                  </span>
                  <p className="text-muted-foreground text-xs">
                    By clicking this checkbox, you agree to the terms and
                    conditions
                  </p>
                </div>
              </div>
            </Card>
            <Separator className="mt-4" orientation="horizontal" />
          </div>
        </div>

        <div className="mt-10 flex flex-row gap-2 justify-end">
          <Button variant={"secondary"} onClick={() => api?.scrollPrev()}>
            Back
          </Button>
          <Button
            disabled={Object.values(config).every((v) => v === false)}
            onClick={() => console.log(config)}
          >
            {Object.values(config).every((v) => v === false)
              ? "Select Option"
              : "Continue"}
          </Button>
        </div>
      </CarouselItem>
    </>
  );
};

export default ScannerBuilder;
