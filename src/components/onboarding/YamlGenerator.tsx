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
}) => {
  const activeOrg = useActiveOrg();

  const activeProject = useActiveProject();
  const asset = useActiveAsset();

  const [config, setConfig] = useState<Config>({
    "secret-scanning": true,
    sca: true,
    "container-scanning": true,
    sast: true,
    iac: true,
  });

  useEffect(() => {
    api?.reInit(); //this is redundant rn, will change
  }, [api, config]);

  function codeStringBuilder() {
    const base = gitInstance === "GitHub" ? "\njobs:" : "\ninclude:";
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

    return base + codeString;
  }
  return (
    <CarouselItem className="">
      <DialogHeader>
        {gitInstance === "GitHub" && (
          <DialogTitle>Add the snippet to your GitHub Actions File</DialogTitle>
        )}
        {gitInstance === "Gitlab" && (
          <DialogTitle>Add the snippet to your GitLab CI/CD File</DialogTitle>
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
        codeString={`# .${gitInstance}/workflows/devsecops.yml ${codeStringBuilder()} `}
      ></CopyCode>
      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button variant={"secondary"} onClick={() => prev?.()}>
          Back
        </Button>
        <Button
          disabled={Object.values(config).every((v) => v === false)}
          onClick={() => {
            async () => {
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
                  "We did not receive any information from your pipeline yet. You can safely close the dialog and refresh the page yourself after the pipeline did finish.",
                );
              }
            };
          }}
        >
          {Object.values(config).every((v) => v === false)
            ? "Select Option"
            : "Done!"}
        </Button>
      </div>
    </CarouselItem>
  );
};

export default YamlGenerator;
