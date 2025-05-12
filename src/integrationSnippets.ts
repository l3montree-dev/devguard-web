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
) => `docker run -v "$(PWD):/app" ghcr.io/l3montree-dev/devguard-scanner:${config.devguardScannerTag} \\ 
devguard-scanner ${command} \\
    --path="/app" \\
    --assetName="${orgSlug}/projects/${projectSlug}/assets/${assetSlug}" \\
    --apiUrl="${apiUrl}" \\
    --token="${token ? token : "TOKEN"}"`;

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

    custom: `jobs:
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
    custom: `# DevGuard CI/CD Component (https://gitlab.com/l3montree/devguard)
include:
    - remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/upload-sarif.yml"
      inputs:
          asset_name: ${orgSlug}/projects/${projectSlug}/assets/${assetSlug}
          token: "$DEVGUARD_TOKEN"
          api_url: ${apiUrl}
          sarif_file: ./results.sarif # Path to SARIF file relative to the root of the repository`,
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
    custom: generateDockerSnippet(
      "sarif",
      orgSlug,
      projectSlug,
      assetSlug,
      apiUrl,
      token,
    ),
  },
});
