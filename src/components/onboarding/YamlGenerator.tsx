// Copyright 2025 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { Config, GitInstances } from "@/types/common";
import router from "next/router";
import { useEffect } from "react";
import { toast } from "sonner";
import { integrationSnippets } from "../../integrationSnippets";
import CopyCode, { CopyCodeFragment } from "../common/CopyCode";
import { Button } from "../ui/button";
import { CarouselApi, CarouselItem } from "../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

export const YamlGenerator = ({
  api,
  gitInstance,
  apiUrl,
  prev,
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
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  config: Config;
}) => {
  const activeOrg = useActiveOrg();

  const activeProject = useActiveProject();
  const asset = useActiveAsset();

  useEffect(() => {
    api?.reInit(); //this is redundant rn, will change
  }, [api, config]);

  function codeStringBuilder() {
    const base =
      gitInstance === "GitHub"
        ? `\n
name: DevGuard DevSecOps
on:
  push:
jobs:
  `
        : "\ninclude:";

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
              codeString={
                gitInstance === "GitHub"
                  ? `.${gitInstance.toLowerCase()}/workflows/devsecops.yml`
                  : `.gitlab-ci.yml`
              }
            />
            file or add the code snippet to an existing workflow file.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-10">
          <CopyCode
            language="yaml"
            codeString={
              gitInstance === "GitHub"
                ? `# .${gitInstance.toLowerCase()}/workflows/devsecops.yml ${codeStringBuilder()} `
                : `# .gitlab-ci.yml \n ${codeStringBuilder()}`
            }
          />
        </div>
        <div className="mt-10 flex flex-row gap-2 justify-end">
          <Button variant={"secondary"} onClick={() => prev?.()}>
            Back
          </Button>
          <Button
            disabled={Object.values(config).every((v) => v === false)}
            onClick={async () => {
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
            }}
          >
            {Object.values(config).every((v) => v === false)
              ? "Select Option"
              : "Finish Setup"}
          </Button>
        </div>
      </CarouselItem>
    </>
  );
};

export default YamlGenerator;
