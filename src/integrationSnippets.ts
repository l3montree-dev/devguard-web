import { config } from "./config";

const generateWorkflowSnippet = (
  jobName: string,
  workflowFile: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontUrl: string,
) => `
    ${jobName}:
        uses: l3montree-dev/devguard-action/.github/workflows/${workflowFile}@main
        with:
            asset-name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
            api-url: "${apiUrl}"
            web-ui: "${frontUrl}"
        secrets:
            devguard-token: "\${{ secrets.DEVGUARD_TOKEN }}" # you need to create this secret in your GitHub repository settings
        ${jobName === "container-scanning" ? "needs: build-image" : ""}   `;

const generateGitlabSnippet = (
  jobName: string,
  workflowFile: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontUrl: string,
) => `
- remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/${workflowFile}"
  inputs:
    asset_name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
    token: "$DEVGUARD_TOKEN"
    api_url: "${apiUrl}"
    web_ui: "${frontUrl}"
    ${jobName === "container-scanning" ? "needs: build" : ""}   `;

const generateDockerSnippet = (
  command: string,
  orgSlug: string,
  projectSlug: string,
  assetSlug: string,
  apiUrl: string,
  frontUrl: string,
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
    --webUI="${frontUrl}`;
};

export const integrationSnippets = ({
  orgSlug,
  projectSlug,
  assetSlug,
  apiUrl,
  frontUrl,
  token,
}: {
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  apiUrl: string;
  frontUrl: string;
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
      frontUrl,
    ),
    "container-scanning": generateWorkflowSnippet(
      "container-scanning",
      "container-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),
    iac: generateWorkflowSnippet(
      "infrastructure-as-code-scanning",
      "iac.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),

    sast: generateWorkflowSnippet(
      "bad-practice-finder",
      "sast.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),
    devsecops: generateWorkflowSnippet(
      "call-devsecops",
      "full.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),
    "secret-scanning": generateWorkflowSnippet(
      "find-leaked-secrets",
      "secret-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),

    build: generateWorkflowSnippet(
      "build-image",
      "build-image.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
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
      frontUrl,
    ),
    "container-scanning": generateGitlabSnippet(
      "container-scanning",
      "container-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),
    iac: generateGitlabSnippet(
      "infrastructure-as-code-scanning",
      "infrastructure-as-code-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),
    sast: generateGitlabSnippet(
      "bad-practice-finder",
      "sast.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),
    devsecops: generateGitlabSnippet(
      "call-devsecops",
      "full.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),
    "secret-scanning": generateGitlabSnippet(
      "find-leaked-secrets",
      "secret-scanning.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),
    sarif: `# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
include:
    - remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/upload-sarif.yml"
      inputs:
          asset_name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
          token: "$DEVGUARD_TOKEN"
          api_url: ${apiUrl}
          sarif_file: ./results.sarif # Path to SARIF file relative to the root of the repository`,
    sbom: `# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
include:
    - remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/upload-sbom.yml"
      inputs:
          asset_name: "${orgSlug}/projects/${projectSlug}/assets/${assetSlug}"
          token: "$DEVGUARD_TOKEN"
          api_url: ${apiUrl}
          sbom_file: ./results.sbom # Path to SBOM file relative to the root of the repository`,
    build: generateGitlabSnippet(
      "build",
      "build.yml",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
    ),
  },

  Docker: {
    iac: generateDockerSnippet(
      "iac",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
      token,
    ),
    sast: generateDockerSnippet(
      "sast",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
      token,
    ),
    "secret-scanning": generateDockerSnippet(
      "secret-scanning",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
      token,
    ),
    sarif: generateDockerSnippet(
      "sarif",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
      token,
    ),
    sbom: generateDockerSnippet(
      "sbom",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
      token,
    ),
    "software-composition-analysis-from-repository": generateDockerSnippet(
      "software-composition-analysis-from-repository",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
      token,
    ),
    "container-scanning": generateDockerSnippet(
      "container-scanning",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
      token,
    ),
    sca: generateDockerSnippet(
      "sca",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      frontUrl,
      token,
    ),
  },
});
