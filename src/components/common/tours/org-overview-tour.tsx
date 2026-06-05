import type { ConditionalStep } from "@/hooks/usePageTour";
import { TourLink } from "./TourLink";

const DOCS = "https://docs.devguard.org";

export const orgOverviewTourSteps: ConditionalStep[] = [
  {
    selector: '[data-tour="overview-header"]',
    content:
      "Welcome to the Organization Overview. Here you get a consolidated view of all vulnerability data across your entire organization.",
  },
  {
    selector: '[data-tour="view-mode-tabs"]',
    content: (
      <>
        Switch between{" "}
        <TourLink href={`${DOCS}/explanations/core-concepts/risk-scoring`}>
          Risk-based
        </TourLink>{" "}
        and{" "}
        <TourLink href={`${DOCS}/explanations/core-concepts/risk-scoring`}>
          CVSS-based
        </TourLink>{" "}
        scoring. Risk takes threat intelligence (EPSS, exploit availability)
        into account, while CVSS shows the raw severity score.
      </>
    ),
  },
  {
    selector: '[data-tour="composition-section"]',
    content:
      "The Organization Composition shows how your software is structured — broken down by projects, assets, and components — and highlights the most vulnerable dependencies.",
  },
  {
    selector: '[data-tour="vuln-distribution-section"]',
    content:
      "The Total Vulnerability Distribution gives you a count of all open vulnerabilities across the organization, split by severity level. Use this to understand your overall exposure at a glance.",
  },
  {
    selector: '[data-tour="average-stats-section"]',
    content: (
      <>
        Average Open Vulnerabilities per Project shows you the mean number of
        unresolved issues per project. It also includes{" "}
        <TourLink
          href={`${DOCS}/how-to-guides/vulnerability-management/track-fix-progress`}
        >
          remediation trends
        </TourLink>{" "}
        so you can track whether your team is keeping up.
      </>
    ),
  },
];
