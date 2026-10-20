// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier:   AGPL-3.0-or-later

import type { Config } from "./types/common";

import type { JobName } from "@/types/view/integration";

const githubJobIds: Record<JobName, string> = {
  "secret-scanning": "find-leaked-secrets",
  sast: "bad-practice-finder",
  iac: "infrastructure-as-code-scanning",
  sca: "dependency-scanning",
  build: "build-image",
  "container-scanning": "container-scanning",
  push: "push-image",
  sign: "sign-image",
  attest: "attest-image",
  full: "call-devsecops",
  "sarif-upload": "code-risk-identification",
  "sbom-upload": "dependency-risk-identification",
};

const yamlGithub: Record<
  JobName,
  (config: Config & { frontendUrl: string }) => {
    with?: string;
    needs?: JobName[];
  }
> = {
  "secret-scanning": (config) => ({
    with: `
            devguard-web-ui: "${config.frontendUrl}"`,
  }),
  sast: (config) => ({
    with: `
            devguard-web-ui: "${config.frontendUrl}"`,
  }),
  iac: (config) => ({
    with: `
            devguard-web-ui: "${config.frontendUrl}"`,
  }),
  sca: (config) => ({
    with: `
            devguard-web-ui: "${config.frontendUrl}"`,
  }),
  "container-scanning": (config) => ({
    with: `
            devguard-web-ui: "${config.frontendUrl}"`,
    needs: config.build ? ["build"] : [],
  }),
  build: () => ({}),
  push: (config) => {
    if (config["container-scanning"]) {
      return { needs: ["container-scanning"] };
    } else if (config.build) {
      return { needs: ["build"] };
    }
    return {};
  },
  sign: (config) => {
    if (config.push) {
      return { needs: ["push"] };
    } else if (config["container-scanning"]) {
      return { needs: ["container-scanning"] };
    } else if (config.build) {
      return { needs: ["build"] };
    }
    return {};
  },
  attest: (config) => {
    // attest fetches the sbom, vex and sarif from DevGuard,
    // so it has to wait for every job which uploads results
    let needs: JobName[] = [];
    if (config["secret-scanning"]) {
      needs.push("secret-scanning");
    }
    if (config.sast) {
      needs.push("sast");
    }
    if (config.iac) {
      needs.push("iac");
    }
    if (config.sarif) {
      needs.push("sarif-upload");
    }
    if (config.sca) {
      needs.push("sca");
    }
    if (config["container-scanning"]) {
      needs.push("container-scanning");
    }
    if (config.sbom) {
      needs.push("sbom-upload");
    }
    // the image has to be in the registry before it can be attested
    if (config.push) {
      needs.push("push");
    } else if (config.build && !config["container-scanning"]) {
      needs.push("build");
    }
    return { needs };
  },
  "sarif-upload": (config) => ({
    with: `
            devguard-web-ui: "${config.frontendUrl}"
            sarif-file: "./results.sarif"`,
  }),
  "sbom-upload": (config) => ({
    with: `
            devguard-web-ui: "${config.frontendUrl}"
            sbom-file: "./results.sbom"`,
  }),
  full: (config) => ({
    with: `
            devguard-web-ui: "${config.frontendUrl}"`,
  }),
};

const generateWorkflowSnippet = (
  jobName: JobName,
  workflowFile: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontendUrl: string,
  config: Config,
) => {
  const jobSpecificConfig = yamlGithub[jobName]({
    ...config,
    frontendUrl,
  });

  const needs =
    jobSpecificConfig.needs && jobSpecificConfig.needs.length > 0
      ? `
        needs:
${jobSpecificConfig.needs.map((n) => `            - ${githubJobIds[n]}`).join("\n")}`
      : "";

  return `
    ${githubJobIds[jobName]}:
        uses: l3montree-dev/devguard-ci-components/.github/workflows/${workflowFile}@main${needs}
        with:
            devguard-asset-name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
            devguard-api-url: "${apiUrl}"${jobSpecificConfig.with ?? ""}
        secrets:
            devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}" # you need to create this secret in your GitHub repository settings`;
};

const yamlGitlab: Record<
  JobName,
  (config: Config & { frontendUrl: string }) => string
> = {
  "secret-scanning": (config) => `
    devguard_web_ui: "${config.frontendUrl}"
    stage: "test"
    `,
  sast: (config) => `
    devguard_web_ui: "${config.frontendUrl}"
    stage: "test"
    `,
  iac: (config) => `
    devguard_web_ui: "${config.frontendUrl}"
    stage: "test"
    `,
  sca: (config) => `
    devguard_web_ui: "${config.frontendUrl}"
    stage: "test"
    `,
  "container-scanning": (config) => {
    let snippet = `
    devguard_web_ui: "${config.frontendUrl}"
    stage: "oci-image"
    image_tar_path: "image.tar"`;
    if (config.build) {
      snippet += `
    needs:
      - devguard:build_oci_image
    dependencies:
      - devguard:build_oci_image
      `;
    }
    return snippet;
  },
  build: () => `
    stage: "oci-image"
    image: "image.tar"
    image_tag: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
    build_args: "--context $CI_PROJECT_DIR --dockerfile $CI_PROJECT_DIR/Dockerfile"`,
  push: (config) => {
    let snippet = `
    stage: "oci-image"
    image: "image.tar"
    image_tag: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"`;
    if (config["container-scanning"]) {
      snippet += `
    needs:
      - devguard:container_scanning
    dependencies:
      - devguard:container_scanning
    `;
    } else if (config.build) {
      snippet += `
    needs:
      - devguard:build_oci_image
    dependencies:
      - devguard:build_oci_image
    `;
    }
    return snippet;
  },
  sign: (config) => {
    let snippet = `
    stage: "attestation"
    images:
      - "$CI_REGISTRY_IMAGE:latest"`;
    if (config.push) {
      snippet += `
    needs:
      - devguard:push_oci_image
    dependencies:
      - devguard:push_oci_image`;
    } else if (config["container-scanning"]) {
      snippet += `
    needs:
      - devguard:container_scanning
    dependencies:
      - devguard:container_scanning`;
    } else if (config.build) {
      snippet += `
    needs:
      - devguard:build_oci_image
    dependencies:
      - devguard:build_oci_image`;
    }
    return snippet;
  },
  attest: (config) => {
    let snippet = `
    stage: "attestation"
    devguard_artifact_name: "pkg:oci/my-app"
    image: "$CI_REGISTRY_IMAGE:latest"`;

    let attestations = [];
    let needs = [];
    if (
      config["secret-scanning"] ||
      config.sast ||
      config.iac ||
      config.sarif
    ) {
      attestations.push(`      - source: "https://api.devguard.org/api/v1/artifacts/ARTIFACT_NAME/sarif.json"
        predicate_type: "https://github.com/in-toto/attestation/blob/main/spec/predicates/cyclonedx.md"`);
    }
    if (config.sca || config["container-scanning"] || config.sbom) {
      attestations.push(`      - source: "https://api.devguard.org/api/v1/artifacts/ARTIFACT_NAME/sbom.json"
        predicate_type: "https://github.com/in-toto/attestation/blob/main/spec/predicates/cyclonedx.md"`);
    }

    if (attestations.length > 0) {
      snippet += `
    attestations:
${attestations.join("\n")}`;
    }

    if (config["secret-scanning"]) {
      needs.push("devguard:secret_scanning");
    }
    if (config.sast) {
      needs.push("devguard:sast");
    }
    if (config.iac) {
      needs.push("devguard:iac");
    }
    if (config.sarif) {
      needs.push("devguard:sarif_upload");
    }
    if (config.sca) {
      needs.push("devguard:software_composition_analysis");
    }
    if (config["container-scanning"]) {
      needs.push("devguard:container_scanning");
    }

    if (config.sbom) {
      needs.push("devguard:sbom_upload");
    }

    if (needs.length > 0) {
      snippet += `
    needs:
${needs.map((n) => `      - ${n}`).join("\n")}`;
    }
    return snippet;
  },
  "sarif-upload": () => `
    stage: "test"
    sarif_file: "results.sarif"
    `,
  "sbom-upload": () => `
    stage: "test"
    sbom_file: "results.sbom"
    `,
  full: (config) => `
    devguard_web_ui: "${config.frontendUrl}"
    `,
};

const generateGitlabSnippet = (
  jobName: JobName,
  workflowFile: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontendUrl: string,
  devguardCIComponentBase: string,
  config: Config,
) => {
  const baseSnippet = `
# See all available inputs here: 
# https://gitlab.com/l3montree/devguard/-/tree/main/templates/${workflowFile}
- remote: "${devguardCIComponentBase}/templates/${workflowFile}"
  inputs:
    devguard_api_url: "${apiUrl}"
    devguard_asset_name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
    devguard_token: "$DEVGUARD_TOKEN"`;

  const jobSpecificConfig = {
    ...config,
    frontendUrl,
  };

  return baseSnippet + yamlGitlab[jobName](jobSpecificConfig);
};

export const generateDockerSnippet = (
  scannerImage: string,
  command: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontendUrl: string,
  token?: string,
) => {
  let path = "/app";
  if (command === "container-scanning") {
    path = "/app/image.tar";
  }

  if (command === "sbom") {
    path = "/app/<SBOM.json>";
  }

  if (command === "sarif") {
    path = "/app/results.sarif";
  }

  if (apiUrl === "http://localhost:8080") {
    apiUrl = "http://host.docker.internal:8080";
  }
  return `docker run -v "$(PWD):/app" ${scannerImage} \\
devguard-scanner ${command} \\
    --path=${path} \\
    --assetName="${orgSlug}/projects/${projectSlug}/assets/${assetSlug}" \\
    --apiUrl="${apiUrl}" \\
    --token="${token ? token : "TOKEN"}" \\
    --webUI="${frontendUrl}"`;
};

export const integrationSnippets = ({
  scannerImage,
  orgSlug,
  projectSlug,
  assetSlug,
  apiUrl,
  frontendUrl,
  devguardCIComponentBase,
  token,
  config,
}: {
  scannerImage: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  apiUrl: string;
  frontendUrl: string;
  devguardCIComponentBase: string;
  token?: string;
  config: Config;
}) => ({
  GitHub: {
    sca: generateWorkflowSnippet(
      "sca",
      "software-composition-analysis.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    "container-scanning": generateWorkflowSnippet(
      "container-scanning",
      "container-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    iac: generateWorkflowSnippet(
      "iac",
      "iac.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    sast: generateWorkflowSnippet(
      "sast",
      "static-application-security-testing.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    devsecops: generateWorkflowSnippet(
      "full",
      "full.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    "secret-scanning": generateWorkflowSnippet(
      "secret-scanning",
      "secret-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    build: generateWorkflowSnippet(
      "build",
      "build-image.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    sarif: generateWorkflowSnippet(
      "sarif-upload",
      "sarif-upload.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    sbom: generateWorkflowSnippet(
      "sbom-upload",
      "sbom-upload.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    push: generateWorkflowSnippet(
      "push",
      "push-oci-image.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    sign: generateWorkflowSnippet(
      "sign",
      "sign.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
    attest: generateWorkflowSnippet(
      "attest",
      "attest.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      config,
    ),
  },

  Gitlab: {
    "secret-scanning": generateGitlabSnippet(
      "secret-scanning",
      "secret-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    sast: generateGitlabSnippet(
      "sast",
      "static-application-security-testing.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    iac: generateGitlabSnippet(
      "iac",
      "infrastructure-as-code-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    sca: generateGitlabSnippet(
      "sca",
      "software-composition-analysis.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    build: generateGitlabSnippet(
      "build",
      "build-oci-image.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    "container-scanning": generateGitlabSnippet(
      "container-scanning",
      "container-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    push: generateGitlabSnippet(
      "push",
      "push-oci-image.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    sign: generateGitlabSnippet(
      "sign",
      "sign-oci-image.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    attest: generateGitlabSnippet(
      "attest",
      "attest.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    devsecops: generateGitlabSnippet(
      "full",
      "full.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),

    sarif: generateGitlabSnippet(
      "sarif-upload",
      "sarif-upload.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
    sbom: generateGitlabSnippet(
      "sbom-upload",
      "sbom-upload.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
      config,
    ),
  },

  Docker: {
    iac: generateDockerSnippet(
      scannerImage,
      "iac",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    sast: generateDockerSnippet(
      scannerImage,
      "sast",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    "secret-scanning": generateDockerSnippet(
      scannerImage,
      "secret-scanning",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    sarif: generateDockerSnippet(
      scannerImage,
      "sarif",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    sbom: generateDockerSnippet(
      scannerImage,
      "sbom",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    "software-composition-analysis-from-repository": generateDockerSnippet(
      scannerImage,
      "software-composition-analysis-from-repository",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    "container-scanning": generateDockerSnippet(
      scannerImage,
      "container-scanning",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    sca: generateDockerSnippet(
      scannerImage,
      "sca",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
  },
});
