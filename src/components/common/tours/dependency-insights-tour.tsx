import type { ConditionalStep } from "@/hooks/usePageTour";
import { TourLink } from "./TourLink";

const DOCS = "https://docs.devguard.org";

export const dependencyInsightsTourSteps: ConditionalStep[] = [
  {
    selector: '[data-tour="dependencies-header"]',
    content: (
      <>
        Welcome to{" "}
        <TourLink
          href={`${DOCS}/how-to-guides/dependency-management/view-dependency-tree`}
        >
          Dependency Insights
        </TourLink>
        . Here you get a full picture of all third-party packages used in this
        repository — including their licenses,{" "}
        <TourLink
          href={`${DOCS}/explanations/advanced-topics/open-source-insights`}
        >
          OpenSSF health scores
        </TourLink>
        , and publish dates.
      </>
    ),
  },
  {
    selector: '[data-tour="dependencies-actions"]',
    content: (
      <>
        Export your{" "}
        <TourLink href={`${DOCS}/explanations/explaining-sboms`}>SBOM</TourLink>{" "}
        or a{" "}
        <TourLink href={`${DOCS}/explanations/compliance/csaf-vex-explained`}>
          VEX
        </TourLink>{" "}
        document to share dependency and vulnerability data with auditors,
        customers, or other tools. You can also open the interactive Dependency
        Graph.
      </>
    ),
  },
  {
    selector: '[data-tour="dependencies-artifact-selector"]',
    content: (
      <>
        Use the{" "}
        <TourLink href={`${DOCS}/explanations/core-concepts/artifacts`}>
          artifact selector
        </TourLink>{" "}
        to filter the list by a specific build artifact. The root node selector
        lets you focus on a subtree of the dependency graph.
      </>
    ),
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
  {
    selector: '[data-tour="help-center"]',
    content: "Need help? Find guides and restart tours here anytime.",
  },
];
