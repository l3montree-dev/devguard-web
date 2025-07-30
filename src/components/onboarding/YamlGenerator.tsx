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
import { Config, GitInstances } from "@/types/common";
import router from "next/router";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { toast } from "sonner";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import WebhookSetupTicketIntegrationDialog from "../guides/WebhookSetupTicketIntegrationDialog";

export const YamlGenerator = ({
  api,
  gitInstance,
  apiUrl,
  setup,
  next,
  prev,
  pat,
  onPatGenerate,
  orgSlug,
  projectSlug,
  assetSlug,
  config,
}: {
  gitInstance: GitInstances;
  next?: () => void;
  prev?: () => void;
  setup?: "own" | "auto-setup";
  api: CarouselApi;
  apiUrl: string;
  pat?: string;
  onPatGenerate: () => void;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  config: Config;
}) => {
  const activeOrg = useActiveOrg();

  const activeProject = useActiveProject();
  const asset = useActiveAsset();

  const [webhookIsOpen, setWebhookIsOpen] = useState(false);

  useEffect(() => {
    api?.reInit(); //this is redundant rn, will change
  }, [api, config]);

  function codeStringBuilder() {
    const base = gitInstance === "GitHub" ? "\njobs:" : "\ninclude:";
    console.log(config, gitInstance);
    const codeString = Object.entries(config)
      .filter(([_, selectedOptionValue]) => selectedOptionValue)
      .map(([selectedOption]) => {
        console.log(selectedOption);
        return integrationSnippets({
          orgSlug,
          projectSlug,
          assetSlug,
          apiUrl,
        })[gitInstance][selectedOption as keyof Config];
      })
      .map((value) => value)
      .join("\n");

    return base + codeString;
  }
  return (
    <>
      <CarouselItem className="">
        <DialogHeader>
          {gitInstance === "GitHub" && (
            <DialogTitle>
              Add the snippet to your GitHub Actions File
            </DialogTitle>
          )}
          {gitInstance === "Gitlab" && (
            <DialogTitle>Add the snippet to your GitLab CI/CD File</DialogTitle>
          )}
          <DialogDescription>
            Create a new
            <CopyCodeFragment
              codeString={`.${gitInstance.toLowerCase()}/workflows/devsecops.yml`}
            />
            file or add the code snippet to an existing workflow file.
          </DialogDescription>
        </DialogHeader>
        <CopyCode
          language="yaml"
          codeString={`# .${gitInstance.toLowerCase()}/workflows/devsecops.yml ${codeStringBuilder()} `}
        ></CopyCode>
        <div className="mt-10 flex flex-row gap-2 justify-end">
          <Button variant={"secondary"} onClick={() => prev?.()}>
            Back
          </Button>
          <Button
            disabled={Object.values(config).every((v) => v === false)}
            onClick={() => {
              setWebhookIsOpen(true);
            }}
          >
            {Object.values(config).every((v) => v === false)
              ? "Select Option"
              : "Continue"}
          </Button>
        </div>
      </CarouselItem>
      {webhookIsOpen && (
        <CarouselItem>
          <WebhookSetupTicketIntegrationDialog
            open={webhookIsOpen}
            onOpenChange={setWebhookIsOpen}
          />
        </CarouselItem>
      )}
    </>
  );
};

export default YamlGenerator;
