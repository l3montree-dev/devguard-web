import type { StepType } from "@reactour/tour";

export const dependencyInsightsTourSteps: StepType[] = [
  {
    selector: '[data-tour="dependencies-header"]',
    content:
      "Welcome to Dependency Insights. Here you get a full picture of all third-party packages used in this repository — including their licenses, OpenSSF health scores, and publish dates.",
  },
  {
    selector: '[data-tour="dependencies-actions"]',
    content:
      "Export your Software Bill of Materials (SBOM) or a VEX document to share dependency and vulnerability data with auditors, customers, or other tools. You can also open the interactive Dependency Graph.",
  },
  {
    selector: '[data-tour="dependencies-artifact-selector"]',
    content:
      "Use the artifact selector to filter the list by a specific build artifact. The root node selector lets you focus on a subtree of the dependency graph.",
  },
  {
    selector: '[data-tour="dependencies-filter"]',
    content:
      "Filter and search dependencies by package name, license, repository URL, stars, forks, or OpenSSF Scorecard rating. This helps you quickly find risky or unwanted packages.",
  },
  {
    selector: '[data-tour="dependencies-table"]',
    content:
      "The table lists your dependencies with columns for package name, license, source repository, OpenSSF Scorecard score, and publish date. Click any row to open the full dependency detail dialog.",
  },
];
