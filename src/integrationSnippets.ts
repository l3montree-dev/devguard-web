import { config } from "./config";
import { Config } from "./types/common";

type jobName =
  | "secret-scanning"
  | "sast"
  | "iac"
  | "sca"
  | "build"
  | "container-scanning"
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

const yamlGitlab: Record<
  jobName,
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
  build: (config) => `
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
  "sarif-upload": (config) => `
    stage: "test"
    sarif_file: "results.sarif"
    `,
  "sbom-upload": (config) => `
    stage: "test"
    sbom_file: "results.sbom"
    `,
  full: (config) => `
    devguard_web_ui: "https://app.devguard.org"
    `,
};

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
devguard-scanner ${command} \\
    --path=${path} \\
    --assetName="${orgSlug}/projects/${projectSlug}/assets/${assetSlug}" \\
    --apiUrl="${apiUrl}" \\
    --token="${token ? token : "TOKEN"}" \\
    --webUI="${frontendUrl}"`;
};

export const generateCliSnippet = (
  command: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontendUrl: string,
  token?: string,
) => {
  return `devguard-scanner ${command} . \\
    --assetName="${orgSlug}/projects/${projectSlug}/assets/${assetSlug}" \\
    --apiUrl="${apiUrl}" \\
    --token="${token ? token : "TOKEN"}" \\
    --webUI="${frontendUrl}"`;
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
      "static-application-security-testing.yml",
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

    sarif: `
    sarif-risk-identification:
        uses: ./.github/workflows/code-risk-identification.yml
        with:
            asset-name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
            api-url: "${apiUrl}"
            sarif-file: "./results.sarif"
            web-ui: "${frontendUrl}"
        secrets:
            devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}"`,
    sbom: `
    sbom-risk-identification:
        uses: ./.github/workflows/sbom-risk-identification.yml
        with:
            asset-name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
            api-url: "${apiUrl}"
            sbom-file: "./results.sbom"
            web-ui: "${frontendUrl}"
        secrets:
            devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}"`,
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
