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
import { CarouselItem } from "../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Accordion } from "../ui/accordion";
import Callout from "../common/Callout";
import { classNames } from "@/utils/common";

export const ScannerBuilder = ({
  //   pat,
  //   next,
  //   prev,
  setup,
  //   onPatGenerate,
  //   apiUrl,
  //   orgSlug,
  //   projectSlug,
  //   assetSlug,
}: {
  //   pat?: string;
  next?: () => void;
  prev?: () => void;
  //   onPatGenerate: () => void;
  setup?: "own" | "auto-setup";
  //   apiUrl: string;
  //   orgSlug: string;
  //   projectSlug: string;
  //   assetSlug: string;
}) => {
  const [disableAll, setDisableAll] = useState(false);
  const [one, setOne] = useState(true);
  const [two, setTwo] = useState(true);
  const [three, seThree] = useState(true);
  const [four, setFour] = useState(true);
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
              <div>Disable all</div>
              <Checkbox
                defaultChecked={false}
                onCheckedChange={() => setDisableAll(true)}
              />
            </div>
            <Separator className="mt-4" orientation="horizontal" />
            <h3 className="mt-4 mb-2">What should Devguard do for you?</h3>
            {/* border-yellow-300 bg-yellow-500/20 text-yellow-950
            dark:border-yellow-700 dark:text-yellow-100 */}
            <Card>
              <div className="flex flex-col space-y-4 ml-2">
                <div className="space-x-2">
                  <Checkbox
                    defaultChecked={true}
                    onChange={() => setOne(true)}
                  />
                  <span>Identity Aware Proxy </span>
                  <p className="text-muted-foreground text-xs">
                    By clicking this checkbox, you agree to the terms and
                    conditions
                  </p>
                </div>
                <div className="space-x-2">
                  <Checkbox defaultChecked={true} />
                  <span>
                    Scan your Dependencies for known Vulnerabilities (SCA)
                  </span>
                  <p className="text-muted-foreground text-xs">
                    By clicking this checkbox, you agree to the terms and
                    conditions
                  </p>
                </div>
                <div className="space-x-2">
                  <Checkbox defaultChecked={true} />
                  <span>Build your Container Image</span>
                  <p className="text-muted-foreground text-xs">
                    By clicking this checkbox, you agree to the terms and
                    conditions
                  </p>
                </div>
                <div className="space-x-2">
                  <Checkbox defaultChecked={true} />
                  <span>Identify Bad Practices in Your Code (SAST)</span>
                  <p className="text-muted-foreground text-xs">
                    By clicking this checkbox, you agree to the terms and
                    conditions
                  </p>
                </div>
                <div className="space-x-2">
                  <Checkbox defaultChecked={true} />
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
            <div className="grid gap-2">
              <Label htmlFor="terms-2">Accept terms and conditions</Label>
              <p className="text-muted-foreground text-sm">
                By clicking this checkbox, you agree to the terms and
                conditions.
              </p>
            </div>
          </div>
        </div>

        {/* <div className="mt-10"></div> */}
        <div className="flex mt-10 flex-row gap-2 justify-end">
          {/* <Button variant={"secondary"} onClick={prev}>
            Back
          </Button> */}
          {/* <Button onClick={next}>Continue</Button> */}
        </div>
      </CarouselItem>
    </>
  );
};

export default ScannerBuilder;
