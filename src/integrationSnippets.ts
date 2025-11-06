import { s } from "framer-motion/dist/types.d-Cjd591yU";
import { config } from "./config";
import { sign } from "crypto";
import { Config } from "./types/common";

type jobName =
  | "secret-scanning"
  | "sast"
  | "iac"
  | "sca"
  | "container-scanning"
  | "build"
  | "push"
  | "sign"
  | "attest"
  | "full"
  | "sbom-upload"
  | "sarif-upload";

const generateWorkflowSnippet = (
  jobName: string,
  workflowFile: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontendUrl: string,
) => `
    ${jobName}:
        uses: l3montree-dev/devguard-action/.github/workflows/${workflowFile}@main
        with:
            asset-name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
            api-url: "${apiUrl}"
            ${jobName === "build-image" ? "" : `web-ui: "${frontendUrl}"`}
        secrets:
            devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}" # you need to create this secret in your GitHub repository settings`;

const generateGitlabSnippet = (
  jobName: jobName,
  workflowFile: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontendUrl: string,
  devguardCIComponentBase: string,
  config: Config,
) => {
  let snippet = `
# See all available inputs here: 
# https://gitlab.com/l3montree/devguard/-/tree/main/templates/${workflowFile}
- remote: "${devguardCIComponentBase}/templates/${workflowFile}"
  inputs:
    devguard_api_url: "${apiUrl}"
    devguard_asset_name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
    devguard_token: "$DEVGUARD_TOKEN"`;

  switch (jobName) {
    case "secret-scanning":
      snippet += `
    devguard_web_ui: "${frontendUrl}"
    stage: "test"
    `;
      break;
    case "sast":
      snippet += `
    devguard_web_ui: "${frontendUrl}"
    stage: "test"
    `;
      break;
    case "iac":
      snippet += `
    devguard_web_ui: "${frontendUrl}"
    stage: "test"
    `;
      break;
    case "sca":
      snippet += `
    devguard_web_ui: "${frontendUrl}"
    stage: "test"
    `;
      break;
    case "container-scanning":
      snippet += `
    devguard_web_ui: "${frontendUrl}"
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
      break;
    case "build":
      snippet += `
    stage: "oci-image"
    image: "image.tar"
    image_tag: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
    build_args: "--context $CI_PROJECT_DIR --dockerfile $CI_PROJECT_DIR/Dockerfile"`;
      break;
    case "push":
      snippet += `
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
      break;
    case "sign":
      snippet += `
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
      break;
    case "attest":
      snippet += `
    stage: "attestation"
    devguard_artifact_name: "pkg:oci/my-app"
    image: "$CI_REGISTRY_IMAGE:latest"
    attestations:
      - source: "sbom.json"
        predicate_type: "https://spdx.dev/Document"
      - source: "https://api.devguard.org/api/v1/artifacts/ARTIFACT_NAME/sbom"
        predicate_type: "https://in-toto.io/attestation/scai/attribute-report/v0.2"`;
      if (config.sign) {
        snippet += `
    needs:
      - devguard:sign_oci_image
    dependencies:
      - devguard:sign_oci_image`;
      } else if (config.push) {
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
      break;
    case "sarif-upload":
      snippet += `
    stage: "test"
    sarif_file: "results.sarif"
    `;
      break;
    case "sbom-upload":
      snippet += `
    stage: "test"
    sbom_file: "results.sbom"
    `;
      break;
    case "full":
      snippet += `
    devguard_web_ui: "https://app.devguard.org"
    `;
      break;
  }

  return snippet;
};

const generateDockerSnippet = (
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
  return `docker run -v "$(PWD):/app" ghcr.io/l3montree-dev/devguard/scanner:${config.devguardScannerTag} \\
devguard-scanner ${command} ${path} \\
    --assetName="${orgSlug}/projects/${projectSlug}/assets/${assetSlug}" \\
    --apiUrl="${apiUrl}" \\
    --token="${token ? token : "TOKEN"}" \\
    --webUI="${frontendUrl}`;
};

export const integrationSnippets = ({
  orgSlug,
  projectSlug,
  assetSlug,
  apiUrl,
  frontendUrl,
  devguardCIComponentBase,
  token,
  config,
}: {
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
      "dependency-scanning",
      "software-composition-analysis.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
    ),
    "container-scanning": generateWorkflowSnippet(
      "container-scanning",
      "container-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
    ),
    iac: generateWorkflowSnippet(
      "infrastructure-as-code-scanning",
      "iac.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
    ),

    sast: generateWorkflowSnippet(
      "bad-practice-finder",
      "sast.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
    ),
    devsecops: generateWorkflowSnippet(
      "call-devsecops",
      "full.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
    ),
    "secret-scanning": generateWorkflowSnippet(
      "find-leaked-secrets",
      "secret-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
    ),

    build: generateWorkflowSnippet(
      "build-image",
      "build-image.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
    ),

    sarif: `jobs:
    code-risk-identification: # what you want to name the job
        steps:
            # ...
            # generate the SARIF file
            # ...
            - uses: l3montree-dev/devguard-action/.github/workflows/upload-sarif.yml@main
              with:
                  # Path to SARIF file relative to the root of the repository
                  sarif-file: ./results.sarif
                  asset-name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
                  api-url: "${apiUrl}"
                  web-ui: "${frontendUrl}"
              secrets:
                  devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}" # you need to create`,
    sbom: `jobs:
    code-risk-identification: # what you want to name the job
        steps:
            # ...
            # generate the SBOM file
            # ...
            - uses: l3montree-dev/devguard-action/.github/workflows/upload-sbom.yml@main
              with:
                  # Path to SBOM file relative to the root of the repository
                  sbom-file: ./results.sbom
                  asset-name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
                  api-url: "${apiUrl}"
                  web-ui: "${frontendUrl}"
              secrets:
                  devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}" # you need to create this secret in your GitHub repository settings`,
    push: "",
    sign: "",
    attest: "",
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
      "sast.yml",
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
      "iac",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    sast: generateDockerSnippet(
      "sast",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    "secret-scanning": generateDockerSnippet(
      "secret-scanning",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    sarif: generateDockerSnippet(
      "sarif",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    sbom: generateDockerSnippet(
      "sbom",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    "software-composition-analysis-from-repository": generateDockerSnippet(
      "software-composition-analysis-from-repository",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    "container-scanning": generateDockerSnippet(
      "container-scanning",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      token,
    ),
    sca: generateDockerSnippet(
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
