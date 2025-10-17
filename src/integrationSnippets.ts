import { config } from "./config";

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
  jobName: string,
  workflowFile: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontendUrl: string,
  devguardCIComponentBase: string,
) => `
- remote: "${devguardCIComponentBase}/templates/${workflowFile}"
  inputs:
    asset_name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
    token: "$DEVGUARD_TOKEN"
    api_url: "${apiUrl}"
    ${jobName === "build" ? "" : `web_ui: "${frontendUrl}"`}   `;

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
}: {
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  apiUrl: string;
  frontendUrl: string;
  devguardCIComponentBase: string;
  token?: string;
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
  },

  Gitlab: {
    sca: generateGitlabSnippet(
      "dependency-scanning",
      "software-composition-analysis.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
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
    ),
    iac: generateGitlabSnippet(
      "infrastructure-as-code-scanning",
      "infrastructure-as-code-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
    ),
    sast: generateGitlabSnippet(
      "bad-practice-finder",
      "sast.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
    ),
    devsecops: generateGitlabSnippet(
      "call-devsecops",
      "full.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
    ),
    "secret-scanning": generateGitlabSnippet(
      "find-leaked-secrets",
      "secret-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
    ),
    sarif: `# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
include:
    - remote: "${devguardCIComponentBase}/templates/upload-sarif.yml"
      inputs:
          asset_name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
          token: "$DEVGUARD_TOKEN"
          api_url: ${apiUrl}
          sarif_file: ./results.sarif # Path to SARIF file relative to the root of the repository
          web_ui: ${frontendUrl}
          `,
    sbom: `# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
include:
    - remote: "${devguardCIComponentBase}/templates/upload-sbom.yml"
      inputs:
          asset_name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
          token: "$DEVGUARD_TOKEN"
          api_url: ${apiUrl}
          sbom_file: ./results.sbom # Path to SBOM file relative to the root of the repository
          web_ui: ${frontendUrl}
          `,
    build: generateGitlabSnippet(
      "build",
      "build.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontendUrl,
      devguardCIComponentBase,
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
