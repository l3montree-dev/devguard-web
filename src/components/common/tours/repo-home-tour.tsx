import type { ConditionalStep } from "@/hooks/usePageTour";
import { TourLink } from "./TourLink";

const DOCS = "https://docs.devguard.org";

export const repoHomeTourSteps: ConditionalStep[] = [
  {
    selector: '[data-tour="menu"]',
    content: (
      <>
        Overview gives you a quick glance at your repository&apos;s status,
        Dependency Risk lists all identified risks, Code Risks shows potential
        issues in your code and{" "}
        <TourLink
          href={`${DOCS}/explanations/license-management/license-compliance`}
        >
          License Compliance
        </TourLink>{" "}
        ensures your projects adhere to licensing requirements. Also you can see
        your Dependency Insights and create{" "}
        <TourLink
          href={`${DOCS}/how-to-guides/compliance/generate-vex-documents`}
        >
          VEX Rules
        </TourLink>{" "}
        to manage vulnerabilities effectively and also manage your artifacts and
        settings.
      </>
    ),
  },
  {
    selector: '[data-tour="branch-switcher"]',
    content: (
      <>
        You can switch between your{" "}
        <TourLink
          href={`${DOCS}/explanations/core-concepts/repository-versions`}
        >
          branches
        </TourLink>{" "}
        like you do in Git.
      </>
    ),
  },
  {
    selector: '[data-tour="artifact-switcher"]',
    content: (
      <>
        You can switch between your{" "}
        <TourLink href={`${DOCS}/explanations/core-concepts/artifacts`}>
          artifacts
        </TourLink>{" "}
        to analyze different architectures or versions.
      </>
    ),
  },
  {
    selector: '[data-tour="risk-cvss-values"]',
    content: (
      <>
        Choose between our{" "}
        <TourLink href={`${DOCS}/explanations/core-concepts/risk-scoring`}>
          Risk Score
        </TourLink>
        , which shows you the true dependent severity of the vulnerability for
        your project, or the official{" "}
        <TourLink href={`${DOCS}/explanations/core-concepts/risk-scoring`}>
          CVSS score
        </TourLink>
        , which shows the severity of a weak point in general.
      </>
    ),
  },
];
