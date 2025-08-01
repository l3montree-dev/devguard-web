import { config } from "./config";

const generateWorkflowSnippet = (
  jobName: string,
  workflowFile: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
) => `# .github/workflows/devsecops.yml

# DevSecOps Workflow Definition. This workflow is triggered on every push to the repository
name: DevSecOps Workflow
on:
    push:
jobs:
    ${jobName}:
        uses: l3montree-dev/devguard-action/.github/workflows/${workflowFile}@main
        with:
            asset-name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
            api-url: ${apiUrl}
        secrets:
            devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}" # you need to create this secret in your GitHub repository settings`;

const generateGitlabSnippet = (
  jobName: string,
  workflowFile: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
) => `# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
# stages:
# - build
# - test
# - deploy

include:
- remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/${workflowFile}"
  inputs:
    asset_name: ${orgSlug}/projects/${projectSlug}/assets/${assetSlug}
    token: "$DEVGUARD_TOKEN"
    api_url: ${apiUrl}`;

const generateDockerSnippet = (
  command: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
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
    --token="${token ? token : "TOKEN"}"`;
};

export const integrationSnippets = ({
  orgSlug,
  projectSlug,
  assetSlug,
  apiUrl,
  token,
}: {
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  apiUrl: string;
  token?: string;
}) => ({
  GitHub: {
    sca: generateWorkflowSnippet(
      "call-sca",
      "sca.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    "container-scanning": generateWorkflowSnippet(
      "call-container-scanning",
      "container-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    iac: generateWorkflowSnippet(
      "call-sast",
      "sast.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    sast: generateWorkflowSnippet(
      "call-sast",
      "sast.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    devsecops: generateWorkflowSnippet(
      "call-devsecops",
      "full.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    "secret-scanning": generateWorkflowSnippet(
      "call-secret-scanning",
      "secret-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
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
                  api-url: ${apiUrl}
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
                  api-url: ${apiUrl}
              secrets:
                  devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}" # you need to create this secret in your GitHub repository settings`,
  },

  Gitlab: {
    sca: generateGitlabSnippet(
      "call-sca",
      "sca.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    "container-scanning": generateGitlabSnippet(
      "call-container-scanning",
      "container-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    iac: generateGitlabSnippet(
      "call-iac",
      "iac.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    sast: generateGitlabSnippet(
      "call-sast",
      "sast.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    devsecops: generateGitlabSnippet(
      "call-devsecops",
      "full.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    "secret-scanning": generateGitlabSnippet(
      "call-secret-scanning",
      "secret-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
    ),
    sarif: `# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
include:
    - remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/upload-sarif.yml"
      inputs:
          asset_name: ${orgSlug}/projects/${projectSlug}/assets/${assetSlug}
          token: "$DEVGUARD_TOKEN"
          api_url: ${apiUrl}
          sarif_file: ./results.sarif # Path to SARIF file relative to the root of the repository`,
    sbom: `# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
include:
    - remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/upload-sbom.yml"
      inputs:
          asset_name: ${orgSlug}/projects/${projectSlug}/assets/${assetSlug}
          token: "$DEVGUARD_TOKEN"
          api_url: ${apiUrl}
          sbom_file: ./results.sbom # Path to SBOM file relative to the root of the repository`,
  },
  Docker: {
    iac: generateDockerSnippet(
      "iac",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      token,
    ),
    sast: generateDockerSnippet(
      "sast",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      token,
    ),
    "secret-scanning": generateDockerSnippet(
      "secret-scanning",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      token,
    ),
    sarif: generateDockerSnippet(
      "sarif",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      token,
    ),
    sbom: generateDockerSnippet(
      "sbom",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      token,
    ),
    "software-composition-analysis-from-repository": generateDockerSnippet(
      "software-composition-analysis-from-repository",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      token,
    ),
    "container-scanning": generateDockerSnippet(
      "container-scanning",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      token,
    ),
    sca: generateDockerSnippet(
      "sca",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      token,
    ),
  },
});
