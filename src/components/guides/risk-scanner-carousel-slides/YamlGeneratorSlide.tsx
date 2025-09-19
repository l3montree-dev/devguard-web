// Copyright 2025 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { FunctionComponent } from "react";
import { integrationSnippets } from "../../../integrationSnippets";
import {
  AssetDTO,
  OrganizationDetailsDTO,
  ProjectDTO,
} from "../../../types/api/api";
import { Config, GitInstances } from "../../../types/common";
import CopyCode, { CopyCodeFragment } from "../../common/CopyCode";
import { Button } from "../../ui/button";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";

interface YamlGeneratorSlideProps {
  gitInstance: GitInstances;
  config: Config;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  apiUrl: string;
  frontendUrl: string;
  activeOrg: OrganizationDetailsDTO;
  activeProject: ProjectDTO | null;
  asset: AssetDTO | null;
  prevIndex: number;
  api?: {
    scrollTo: (index: number) => void;
  };
  onClose: () => void;
}

const YamlGeneratorSlide: FunctionComponent<YamlGeneratorSlideProps> = ({
  gitInstance,
  config,
  orgSlug,
  projectSlug,
  assetSlug,
  apiUrl,
  frontendUrl,
  prevIndex,
  api,
  onClose,
}) => {
  function codeStringBuilder() {
    const base =
      gitInstance === "GitHub"
        ? `
name: DevGuard DevSecOps

on:
    push:

permissions:
    contents: read
    packages: write

jobs:`
        : "\ninclude:";

    let codeString = "";
    if (Object.values(config).every((v) => v === true)) {
      codeString = integrationSnippets({
        orgSlug,
        projectSlug,
        assetSlug,
        apiUrl,
        frontendUrl,
      })[gitInstance]["devsecops"];
      return base + codeString;
    } else {
      codeString = Object.entries(config)
        .filter(([_, selectedOptionValue]) => selectedOptionValue)
        .map(([selectedOption]) => {
          return integrationSnippets({
            orgSlug,
            projectSlug,
            assetSlug,
            apiUrl,
            frontendUrl,
          })[gitInstance][selectedOption as keyof Config];
        })
        .map((value) => value)
        .join("\n");
    }

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
            codeString={
              gitInstance === "GitHub"
                ? `.${gitInstance.toLowerCase()}/workflows/devsecops.yml`
                : `.gitlab-ci.yml`
            }
          />
          file or add the code snippet to an existing workflow file.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-10 px-1">
        <CopyCode
          language="yaml"
          codeString={
            gitInstance === "GitHub"
              ? `# .${gitInstance.toLowerCase()}/workflows/devsecops.yml ${codeStringBuilder()} `
              : `# .gitlab-ci.yml \nstages:\n- build\n- test\n- deploy\n ${codeStringBuilder()}`
          }
        />
      </div>
      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button variant={"secondary"} onClick={() => api?.scrollTo(prevIndex)}>
          Back
        </Button>
        <Button
          disabled={Object.values(config).every((v) => v === false)}
          onClick={async () => {
            onClose();
          }}
        >
          {Object.values(config).every((v) => v === false)
            ? "Select Option"
            : "Finish Setup"}
        </Button>
      </div>
    </CarouselItem>
  );
};

export default YamlGeneratorSlide;
