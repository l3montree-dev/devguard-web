import type { ConditionalStep } from "@/hooks/usePageTour";
import { TourLink } from "./TourLink";

const DOCS = "https://docs.devguard.org";

export const dependencyRiskTourSteps: ConditionalStep[] = [
  {
    selector: '[data-tour="cve-detail"]',
    content: (
      <>
        Here you see the ID followed by the Description and our{" "}
        <TourLink href={`${DOCS}/explanations/core-concepts/risk-scoring`}>
          Risk Score
        </TourLink>{" "}
        and Package.
      </>
    ),
  },
  {
    selector: '[data-tour="path"]',
    content: (
      <>
        Here you can see the path to component. You can interact with the graph
        to visit your{" "}
        <TourLink
          href={`${DOCS}/explanations/supply-chain-security/transitive-vulnerability-path-analysis`}
        >
          dependencies
        </TourLink>
        .
      </>
    ),
  },
  {
    selector: '[data-tour="risk-score with details"]',
    content: (
      <>
        Here you see the overall{" "}
        <TourLink href={`${DOCS}/explanations/core-concepts/risk-scoring`}>
          risk score
        </TourLink>{" "}
        and can check detailed risk assessment information.
      </>
    ),
  },
  {
    selector: '[data-tour="affected-component"]',
    content: (
      <>
        Here you can see the affected component and how DevGuard{" "}
        <TourLink
          href={`${DOCS}/explanations/vulnerability-management/vulnerability-matching`}
        >
          matches vulnerabilities
        </TourLink>
        .
      </>
    ),
  },
  {
    selector: '[data-tour="vuln-management"]',
    content: (
      <>
        Here you can{" "}
        <TourLink
          href={`${DOCS}/explanations/vulnerability-management/vulnerability-management-overview`}
        >
          manage vulnerabilities
        </TourLink>{" "}
        and their associated risks to identify them as{" "}
        <TourLink
          href={`${DOCS}/explanations/vulnerability-management/false-positive-detection`}
        >
          false positives
        </TourLink>{" "}
        or confirmed issues.
      </>
    ),
  },
  {
    selector: '[data-tour="help-center"]',
    content: "Need help? Find guides and restart tours here anytime.",
  },
];
