// Copyright 2025 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { FunctionComponent } from "react";
import { integrationSnippets } from "../../../integrationSnippets";
import type { GitInstances } from "../../../types/common";
import { type Config } from "../../../types/common";
import CopyCode from "../../common/CopyCode";
import { InputWithButton } from "../../ui/input-with-button";
import type { Surface } from "@/lib/surface";

export interface PipelineSnippetProps {
  scannerImage: string;
  gitInstance: GitInstances;
  config: Config;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  apiUrl: string;
  frontendUrl: string;
  devguardCIComponentBase: string;
  // the surface the snippet is rendered on
  variant?: Surface;
}

const getGitlabStages = (config: Config) => {
  let stages: string[] = [];
  if (Object.values(config).every((v) => v === true)) {
    stages = ["test", "oci-image", "attestation"];
  } else {
    if (
      config.sca ||
      config["secret-scanning"] ||
      config.iac ||
      config.sast ||
      config.sarif ||
      config.sbom
    ) {
      stages.push("test");
    }
    if (config["container-scanning"] || config.build || config.push) {
      stages.push("oci-image");
    }
    if (config.sign || config.attest) {
      stages.push("attestation");
    }
  }

  return stages.map((stage) => `  - ${stage}`).join("\n");
};

export const pipelineFileName = (gitInstance: GitInstances) =>
  gitInstance === "GitHub"
    ? `.${gitInstance.toLowerCase()}/workflows/devsecops.yml`
    : `.gitlab-ci.yml`;

export const pipelineFileHint =
  "Create a new file or add the code snippet to an existing workflow file.";

const PipelineSnippet: FunctionComponent<PipelineSnippetProps> = ({
  scannerImage,
  gitInstance,
  config,
  orgSlug,
  projectSlug,
  assetSlug,
  apiUrl,
  frontendUrl,
  devguardCIComponentBase,
  variant,
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
    if (
      config["secret-scanning"] &&
      config.sast &&
      config.iac &&
      config.sca &&
      config["container-scanning"] &&
      config.build &&
      config.push &&
      config.sign &&
      config.attest
    ) {
      codeString = integrationSnippets({
        scannerImage,
        orgSlug,
        projectSlug,
        assetSlug,
        apiUrl,
        frontendUrl,
        devguardCIComponentBase,
        config,
      })[gitInstance]["devsecops"];

      if (config.sarif) {
        codeString += `\n${
          integrationSnippets({
            scannerImage,
            orgSlug,
            projectSlug,
            assetSlug,
            apiUrl,
            frontendUrl,
            devguardCIComponentBase,
            config,
          })[gitInstance]["sarif"]
        }`;
      }

      if (config.sbom) {
        codeString += `\n${
          integrationSnippets({
            scannerImage,
            orgSlug,
            projectSlug,
            assetSlug,
            apiUrl,
            frontendUrl,
            devguardCIComponentBase,
            config,
          })[gitInstance]["sbom"]
        }`;
      }

      return base + codeString;
    } else {
      codeString = Object.entries(config)
        .filter(([_, selectedOptionValue]) => selectedOptionValue)
        .map(([selectedOption]) => {
          return integrationSnippets({
            scannerImage,
            orgSlug,
            projectSlug,
            assetSlug,
            apiUrl,
            frontendUrl,
            devguardCIComponentBase,
            config,
          })[gitInstance][selectedOption as keyof Config];
        })
        .map((value) => value)
        .join("\n");
    }

    return base + codeString;
  }

  return (
    <>
      <InputWithButton
        label="File"
        nameKey="devguard-pipeline-file"
        copyable
        copyToastDescription="The file name has been copied to your clipboard."
        variant={variant}
        value={pipelineFileName(gitInstance)}
      />
      <div className="mt-4">
        <CopyCode
          language="yaml"
          codeString={
            gitInstance === "GitHub"
              ? `# .${gitInstance.toLowerCase()}/workflows/devsecops.yml ${codeStringBuilder()} `
              : `# .gitlab-ci.yml \nstages:\n${getGitlabStages(config)} \n ${codeStringBuilder()}`
          }
        />
      </div>
    </>
  );
};

export default PipelineSnippet;
